import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/weather', async (req, res) => {
  const city = req.query.city || 'Ghent';
  const days = req.query.days || 7;
  const key = process.env.WEATHERAPI_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Weather API key not set' });
  }
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 