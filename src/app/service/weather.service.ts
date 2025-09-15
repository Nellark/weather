import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

// Interface for Open-Meteo Current Weather Response
interface OpenMeteoCurrentResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: {
    time: string;
    interval: number;
    is_day: number;
    weathercode: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_humidity: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    soil_temperature_0cm: number;
    soil_temperature_6cm: number;
    soil_temperature_18cm: number;
    soil_temperature_54cm: number;
    soil_moisture_0_1cm: number;
    soil_moisture_1_3cm: number;
    soil_moisture_3_9cm: number;
    soil_moisture_9_27cm: number;
    soil_moisture_27_81cm: number;
  };
  current_units: {
    time: string;
    interval: string;
    is_day: string;
    weather_code: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    precipitation: string;
    weather_humidity: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    wind_gusts_10m: string;
    soil_temperature_0cm: string;
    soil_temperature_6cm: string;
    soil_temperature_18cm: string;
    soil_temperature_54cm: string;
    soil_moisture_0_1cm: string;
    soil_moisture_1_3cm: string;
    soil_moisture_3_9cm: string;
    soil_moisture_9_27cm: string;
    soil_moisture_27_81cm: string;
  };
  hourly_units: { time: string; temperature_2m: string };
  hourly: { time: string[]; temperature_2m: number[] };
}

// Helper to map weather code to text (Open-Meteo uses codes 0-99)
const getWeatherCondition = (code: number): string => {
  const conditions: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    99: 'Thunderstorm with hail'
  };
  return conditions[code] || 'Unknown';
};

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  // Get current weather and hourly forecast by city (uses geocoding)
  getWeatherByCity(city: string): Observable<any> {
    // First, get coordinates for the city using Open-Meteo's built-in geocoding
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    return this.http.get<any>(geoUrl).pipe(
      map((geoData) => {
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error('City not found');
        }
        const { latitude, longitude, name, country, admin1 } = geoData.results[0];
        return { latitude, longitude, name, country, region: admin1 };
      }),
      // Chain to fetch weather data
      switchMap(({ latitude, longitude, name, country, region }) =>
        this.getWeatherByCoords(latitude, longitude).pipe(
          map((weatherData) => ({
            location: { name, country, region },
            current: {
              temp_c: weatherData.current.temperature_2m,
              temp_f: (weatherData.current.temperature_2m * 9/5) + 32,
              condition: { text: getWeatherCondition(weatherData.current.weathercode) },
              humidity: weatherData.current.relative_humidity_2m,
              wind_kph: weatherData.current.wind_speed_10m * 3.6, // m/s to km/h
              wind_dir: `${weatherData.current.wind_direction_10m}°`,
              pressure_mb: 1013, // Not directly available; approximate sea-level pressure
              feelslike_c: weatherData.current.apparent_temperature,
              cloud: 50, // Not directly available; placeholder
              uv: 0, // Requires separate parameter; placeholder
              vis_km: 10, // Placeholder
            },
            forecast: weatherData.hourly, // For future use
          }))
        )
      ),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred.';
        if (error.status === 404 || error.message.includes('City not found')) {
          errorMessage = 'City not found.';
        } else if (error.status === 400) {
          errorMessage = 'Bad Request: Check the city name.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Internal: Get weather by coordinates
  private getWeatherByCoords(latitude: number, longitude: number): Observable<OpenMeteoCurrentResponse> {
    const url = `${this.apiUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m&timezone=auto`;
    return this.http.get<OpenMeteoCurrentResponse>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred while fetching weather.';
        if (error.status === 400) errorMessage = 'Bad Request: Invalid coordinates.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}