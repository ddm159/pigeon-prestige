# 🌍 Real Belgian Weather Integration Setup

## 🚀 Quick Setup Guide

### Step 1: Get Free API Key

1. **Go to OpenWeatherMap**: https://openweathermap.org/api
2. **Sign up for free account** (no credit card required)
3. **Go to "API keys" section** in your account
4. **Copy your API key** (looks like: `1234567890abcdef1234567890abcdef`)

### Step 2: Add API Key to Environment

Create or update your `.env` file in the project root:

```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

### Step 3: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Go to the weather widget** in your game

3. **Click the "Real Weather" button** (purple button)

4. **Check the console** for any errors

## 🔧 How It Works

### **Weather Mapping**
- **Real Belgian weather** → **Game weather types**
- **Thunderstorms** → **Stormy** (high severity)
- **Rain** → **Rainy** (moderate severity)
- **Clear sky** → **Sunny** (low severity)
- **Clouds** → **Cloudy** (low severity)
- **Fog/Mist** → **Foggy** (high severity)

### **Severity Calculation**
- **Based on real conditions**: wind speed, rain intensity, weather type
- **Realistic ranges**: 1-100% based on actual weather
- **No more artificial generation**: uses real meteorological data

### **Temperature**
- **Real Belgian temperatures** in Celsius
- **Accurate seasonal ranges**: follows actual Belgian climate
- **No unrealistic jumps**: based on real weather patterns

## 📅 Automatic Updates

The system is designed to update every **Sunday at 20:00** with fresh Belgian weather data.

### **Manual Updates**
You can also click the **"Real Weather"** button anytime to fetch fresh data.

## 🐛 Troubleshooting

### **API Key Issues**
```
Error: OpenWeatherMap API key not configured
```
**Solution**: Make sure your `.env` file has the correct API key.

### **Network Issues**
```
Error: Failed to fetch Belgian weather
```
**Solution**: Check your internet connection and try again.

### **No Weather Data**
```
Error: No weather data received from API
```
**Solution**: The API might be temporarily unavailable. Try again later.

## 🎯 Benefits

✅ **Authentic Belgian weather** - Real conditions from Belgium  
✅ **Accurate temperatures** - No more unrealistic jumps  
✅ **Realistic severity** - Based on actual weather conditions  
✅ **No more artificial generation** - Uses real meteorological data  
✅ **Weekly updates** - Fresh data every Sunday at 20:00  

## 🔄 Migration from Generated Weather

When you first use real weather:
1. **Click "Real Weather" button**
2. **Old generated data will be replaced** with real Belgian weather
3. **All future updates** will use real weather data

## 📊 API Limits

**Free OpenWeatherMap Plan**:
- 1,000 calls per day
- 7-day forecast included
- Perfect for your pigeon racing game!

## 🎮 Game Integration

The real weather system integrates seamlessly with your existing game:
- **Racing conditions** based on real weather
- **Temperature affects** pigeon performance
- **Severity impacts** race difficulty
- **Day/night cycle** based on real time

---

**Ready to experience authentic Belgian weather in your pigeon racing game! 🇧🇪🌤️** 