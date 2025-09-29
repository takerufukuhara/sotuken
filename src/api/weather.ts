export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    wind_speed_10m: number[];
    relative_humidity_2m?: number[];
  };
  daily: {
    uv_index_max: number[];
  };
}

export async function fetchWeatherByLatLon(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,precipitation_probability,wind_speed_10m,relative_humidity_2m` +
    `&daily=uv_index_max&forecast_days=2&timezone=Asia%2FTokyo`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch weather data: ${res.status}`);
  return await res.json();
}
