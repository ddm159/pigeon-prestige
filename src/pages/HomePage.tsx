import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { homeBaseService } from '../services/homeBaseService';
import { RaceMap } from '../components/RaceMap';
import type { RaceLocation, HomeBaseMarker } from '../components/RaceMap';
import FoodShortageWarning from '../components/FoodShortageWarning';
import WeatherWidget from '../components/WeatherWidget';
import { useNavigate } from 'react-router-dom';

const raceLocations: RaceLocation[] = [
  { name: 'Agen', country: 'France', lat: 44.17497, lng: 0.590515 },
  { name: 'Alençon', country: 'France', lat: 48.4298, lng: 0.0956 },
  { name: 'Auxerre', country: 'France', lat: 47.7982, lng: 3.568 },
  { name: 'Bergerac', country: 'France', lat: 44.8579, lng: 0.4836 },
  { name: 'Bordeaux', country: 'France', lat: 44.8378, lng: -0.5792 },
  { name: 'Boves', country: 'France', lat: 49.7510, lng: 2.3130 },
  { name: 'Canappeville', country: 'France', lat: 49.4010, lng: 0.7270 },
  { name: 'Clermont-Ferrand', country: 'France', lat: 45.7772, lng: 3.0870 },
  { name: 'Dax (St Pandelon)', country: 'France', lat: 43.7106, lng: -1.0554 },
  { name: 'Falaise', country: 'France', lat: 48.8896, lng: -0.1861 },
  { name: 'Fontenay-sur-Eure', country: 'France', lat: 48.4667, lng: 1.5167 },
  { name: 'Fougères', country: 'France', lat: 48.3491, lng: -1.2032 },
  { name: 'Gien', country: 'France', lat: 47.7833, lng: 2.9890 },
  { name: 'Grevillers (Arras)', country: 'France', lat: 50.1910, lng: 2.7280 },
  { name: 'Hazebrouck', country: 'France', lat: 50.7236, lng: 2.6426 },
  { name: 'Lamballe', country: 'France', lat: 48.4729, lng: -2.5300 },
  { name: 'Limoges', country: 'France', lat: 45.8336, lng: 1.2611 },
  { name: 'Magny-Cours', country: 'France', lat: 46.8333, lng: 3.0000 },
  { name: 'Marmande', country: 'France', lat: 44.5021, lng: 0.1575 },
  { name: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698 },
  { name: 'Messac (Ille-et-Vilaine)', country: 'France', lat: 48.1950, lng: -1.6020 },
  { name: 'Mont-de-Marsan', country: 'France', lat: 43.8911, lng: -0.5028 },
  { name: 'Narbonne', country: 'France', lat: 43.1840, lng: 3.0036 },
  { name: 'Nort-sur-Erdre', country: 'France', lat: 47.4800, lng: -1.5450 },
  { name: 'Pau', country: 'France', lat: 43.3017, lng: -0.3686 },
  { name: 'Perpignan', country: 'France', lat: 42.6887, lng: 2.8948 },
  { name: 'Plougastel-Daoulas', country: 'France', lat: 48.3000, lng: -4.3000 },
  { name: 'Reims', country: 'France', lat: 49.2583, lng: 4.0317 },
  { name: 'Rieux-Minervois', country: 'France', lat: 43.3000, lng: 2.5000 },
  { name: 'Rouen-Bihorel', country: 'France', lat: 49.4431, lng: 1.0993 },
  { name: 'Roullet-St-Estèphe', country: 'France', lat: 45.6500, lng: 0.1950 },
  { name: 'Roye', country: 'France', lat: 49.6417, lng: 2.7733 },
  { name: 'Sablé-sur-Sarthe', country: 'France', lat: 47.8290, lng: -0.2000 },
  { name: 'Saintes', country: 'France', lat: 45.7463, lng: -0.6430 },
  { name: 'Sancoins', country: 'France', lat: 46.8567, lng: 2.8675 },
  { name: 'Saran', country: 'France', lat: 47.9650, lng: 1.8680 },
  { name: 'Sigogne', country: 'France', lat: 45.6400, lng: -0.2220 },
  { name: 'St Just', country: 'France', lat: 47.5167, lng: 4.8333 },
  { name: "St Maixent-l'École", country: 'France', lat: 46.4817, lng: -0.2064 },
  { name: 'St Malo', country: 'France', lat: 48.6493, lng: -2.0257 },
  { name: 'St Philbert-du-Peuple', country: 'France', lat: 47.9667, lng: 0.4167 },
  { name: 'St Vincent', country: 'France', lat: 44.6000, lng: 1.0833 },
  { name: 'Tarbes', country: 'France', lat: 43.2333, lng: 0.0833 },
  { name: 'Troyes', country: 'France', lat: 48.2973, lng: 4.0740 },
  { name: 'Vannes (St Allouestre)', country: 'France', lat: 47.6590, lng: -2.7600 },
  { name: 'Vire', country: 'France', lat: 48.8390, lng: -0.9110 },
  { name: 'Vitry-en-Artois', country: 'France', lat: 50.3110, lng: 2.8570 },
  { name: 'Tienen', country: 'Belgium', lat: 50.8060, lng: 4.8500 },
  { name: 'Quiévrain', country: 'Belgium', lat: 50.3983, lng: 3.6970 },
  { name: 'Noyon', country: 'France', lat: 49.5790, lng: 3.0032 },
  { name: 'Dourdan', country: 'France', lat: 48.5283, lng: 2.0107 },
  { name: 'Arras', country: 'France', lat: 50.2910, lng: 2.7778 },
  { name: 'Vierzon', country: 'France', lat: 47.2269, lng: 2.0706 },
  { name: 'Bourges', country: 'France', lat: 47.0810, lng: 2.3988 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { name: 'Palamós', country: 'Spain', lat: 41.8420, lng: 3.1300 },
  { name: 'San Sebastian (Donostia)', country: 'Spain', lat: 43.3183, lng: -1.9812 },
  { name: 'Zaragoza', country: 'Spain', lat: 41.6488, lng: -0.8891 },
];

const HomePage: React.FC = () => {
  const { gameUser, user } = useAuth();
  const [homeBase, setHomeBase] = useState<HomeBaseMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      homeBaseService.getHomeBaseByUserId(user.id).then(data => {
        if (data) {
          setHomeBase({
            city: data.city,
            street: data.street,
            number: data.number,
            lat: data.lat,
            lng: data.lng,
          });
        } else {
          setHomeBase(null);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Pigeon Prestige</h1>
      <p className="text-gray-600 mb-4">Welcome to your pigeon racing empire!</p>
      <div className="max-w-4xl">
        <WeatherWidget />
      </div>
      {user && <FoodShortageWarning userId={user.id} />}
      <div className="bg-green-100 p-4 rounded-lg border border-green-300">
        <h2 className="text-lg font-semibold mb-2 text-green-800">✅ Success!</h2>
        <p className="text-green-700">The HomePage component is working. The issue was elsewhere.</p>
        <p className="text-green-700">User: {user ? 'Logged in' : 'Not logged in'}</p>
        <p className="text-green-700">Game User: {gameUser ? 'Loaded' : 'Not loaded'}</p>
      </div>
      {!loading && user && !homeBase && (
        <div className="my-8 p-6 bg-yellow-100 border border-yellow-300 rounded-lg flex flex-col items-center">
          <p className="mb-4 text-yellow-800 font-semibold text-lg">You have not set a home base yet.</p>
          <button
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded shadow"
            onClick={() => navigate('/onboarding/home-base')}
          >
            Set Your Home Base
          </button>
        </div>
      )}
      <div className="mt-8">
        <RaceMap raceLocations={raceLocations} homeBase={homeBase || undefined} />
      </div>
    </div>
  );
};

export default HomePage; 