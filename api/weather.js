export default async function handler(req, res) {
  try {
    const API_KEY = process.env.WEATHER_API_KEY; 
    
    // --- UPDATED: Hyper-local GPS Routing ---
    const { lat, lon, city } = req.query;
    let url;

    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    } else {
      const CITY = city ? encodeURIComponent(city) : "Noida,IN"; 
      url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`;
    }
    
    const response = await fetch(url);

    if (!response.ok) throw new Error('Weather API failed');

    const data = await response.json();
    
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json({
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main 
    });

  } catch (error) {
    console.error("WEATHER SYNC ERROR:", error);
    return res.status(200).json({ temp: 35, condition: 'Clear' }); 
  }
}