import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherComponent } from './weather/weather.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WeatherComponent],
  template: `<app-weather></app-weather>`,
})
export class AppComponent {}
