export interface WeatherResponse {
    location: {
      name: string;
      region: string;
      country: string;
      lat: number;
      lon: number;
    };
    current: {
      temp_c: number;
      temp_f: number;
      condition: {
        text: string;
        icon: string;
        code: number;
      };
      wind_mph: number;
      wind_kph: number;
      wind_dir: string;
      pressure_mb: number;
      pressure_in: number;
      precip_mm: number;
      precip_in: number;
      humidity: number;
      cloud: number;
      feelslike_c: number;
      feelslike_f: number;
      vis_km: number;
      vis_miles: number;
      uv: number;
      gust_mph: number;
      gust_kph: number;
    };
  }
  
  export interface WeatherCondition {
    type: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';
    icon: string;
    background: string;
    showParticles: boolean;
  }