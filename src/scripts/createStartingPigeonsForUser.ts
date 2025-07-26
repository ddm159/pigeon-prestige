import { pigeonService } from '../services/pigeonService';

// Replace with your actual user ID
const userId = '4ea88e61-8bcc-44d2-b65b-644c88eb54e0';

(async () => {
  try {
    const pigeons = await pigeonService.createStartingPigeons(userId);
    console.log(`Created ${pigeons.length} starting pigeons for user ${userId}`);
    pigeons.forEach((p, i) => console.log(`${i + 1}: ${p.name} (${p.gender}, ${p.age_years}y ${p.age_months}m ${p.age_days}d)`));
  } catch (e) {
    console.error('Error creating starting pigeons:', e);
  }
})(); 