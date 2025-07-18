import React from 'react';
import { foodService } from '../services/foodService';
import type { Food, UserFoodInventory } from '../types/pigeon';

const FoodShop: React.FC = () => {
  const [foods, setFoods] = React.useState<Food[]>([]);
  const [inventory, setInventory] = React.useState<UserFoodInventory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [buying, setBuying] = React.useState<string | null>(null);
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  // TODO: Replace with real user ID from auth context
  const userId = 'me';

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      foodService.listFoods(),
      foodService.getUserInventory(userId),
    ])
      .then(([foods, inventory]) => {
        setFoods(foods);
        setInventory(inventory);
        setError(null);
      })
      .catch((e) => setError(e.message || 'Failed to load food shop'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleQuantityChange = (foodId: string, value: number) => {
    setQuantities((q) => ({ ...q, [foodId]: value }));
  };

  const handleBuy = async (food: Food) => {
    setBuying(food.id);
    setError(null);
    const qty = quantities[food.id] || 1;
    try {
      // Find current inventory
      const inv = inventory.find((i: UserFoodInventory) => i.food_id === food.id);
      const newQty = (inv?.quantity || 0) + qty;
      await foodService.updateUserInventory(userId, food.id, newQty);
      // Refresh inventory
      const updated = await foodService.getUserInventory(userId);
      setInventory(updated);
    } catch (e) {
      setError((e as Error).message || 'Failed to buy food');
    } finally {
      setBuying(null);
    }
  };

  if (loading) return <div>Loading food shop...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3>Food Shop</h3>
      <div style={{ marginBottom: 16 }}>
        <strong>Inventory:</strong>
        <ul>
          {inventory.map(item => {
            const food = foods.find(f => f.id === item.food_id);
            return (
              <li key={item.food_id}>
                {food ? food.name : item.food_id}: {item.quantity}
              </li>
            );
          })}
        </ul>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Best For</th>
            <th>Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {foods.map(food => (
            <tr key={food.id}>
              <td>{food.name}</td>
              <td>{food.price}</td>
              <td>{food.description}</td>
              <td>{food.best_for}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={quantities[food.id] || 1}
                  onChange={e => handleQuantityChange(food.id, Math.max(1, Number(e.target.value)))}
                  style={{ width: 60 }}
                  disabled={buying === food.id}
                />
              </td>
              <td>
                <button
                  onClick={() => handleBuy(food)}
                  disabled={buying === food.id}
                >
                  {buying === food.id ? 'Buying...' : 'Buy'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* TODO: Add tests for FoodShop component */}
    </div>
  );
};

export default FoodShop; 