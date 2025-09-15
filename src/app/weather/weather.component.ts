import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../service/weather.service';


@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class WeatherComponent implements OnInit {
  city: string = '';
  weatherData: any = null;
  forecastData: any = null; 
  errorMessage: string = '';
  isLoading: boolean = false;
  showPopularCities: boolean = true;

  popularCities: string[] = ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'];

  togglePopularCities(): void {
    this.showPopularCities = !this.showPopularCities;
  }

  // For effects (unchanged)
  rainDrops: any[] = Array.from({ length: 30 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 0.5 + Math.random() * 1.5
  }));

  snowflakes: any[] = Array.from({ length: 20 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3
  }));

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    // Default to Durban for testing
    this.searchWeather('Durban');
  }

  searchWeather(cityName: string = this.city) {
    if (!cityName.trim()) return;
    this.isLoading = true;
    this.city = cityName;

    this.weatherService.getWeatherByCity(this.city).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.forecastData = data.forecast; // Hourly from response
        this.errorMessage = '';
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.weatherData = null;
        this.forecastData = null;
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  quickSearch(cityName: string) {
    this.city = cityName;
    this.searchWeather();
  }

  getWeatherClass() {
    if (!this.weatherData || !this.weatherData.current) return '';
    const condition = this.weatherData.current.condition.text.toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) return 'rainy';
    if (condition.includes('snow')) return 'snowy';
    if (condition.includes('clear') || condition.includes('sun')) return 'sunny';
    if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('fog')) return 'cloudy';
    return '';
  }

  showRainEffect() { return this.getWeatherClass() === 'rainy'; }
  showSnowEffect() { return this.getWeatherClass() === 'snowy'; }
  showSunEffect() { return this.getWeatherClass() === 'sunny'; }
  showCloudsEffect() { return this.getWeatherClass() === 'cloudy'; }

  getWeatherIcon() {
    return this.weatherData && this.weatherData.current ? this.weatherData.current.condition.text : '';
  }

  // Helper to get current temperature from forecast (closest hour) - unchanged, but uses forecastData
  getCurrentForecastTemp(): number | null {
    if (!this.forecastData || !this.forecastData.time) return null;
    const now = new Date();
    const utcHour = now.getUTCHours();
    const today = now.toISOString().split('T')[0];
    const index = this.forecastData.time.findIndex((t: string) => t.startsWith(today) && new Date(t).getUTCHours() === utcHour);
    return index !== -1 ? this.forecastData.temperature_2m[index] : null;
  }
}