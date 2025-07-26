import { useState } from 'react';
import { pigeonService } from '../services/pigeonService';

const userId = '4ea88e61-8bcc-44d2-b65b-644c88eb54e0';

export default function AdminPigeonTool() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const pigeons = await pigeonService.createStartingPigeons(userId);
      setResult(
        `Created ${pigeons.length} pigeons:\n` +
        pigeons.map((p, i) => `${i + 1}: ${p.name} (${p.gender}, ${p.age_years}y ${p.age_months}m ${p.age_days}d)`).join('\n')
      );
    } catch (e: unknown) {
      setResult('Error: ' + (e as Error).message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Admin Pigeon Tool</h1>
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating...' : 'Create Starting Pigeons for User'}
      </button>
      <pre style={{ marginTop: 16, color: 'green' }}>{result}</pre>
    </div>
  );
} 