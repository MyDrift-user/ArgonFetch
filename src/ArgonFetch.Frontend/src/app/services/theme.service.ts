import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(true);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme === 'dark');
    }
  }

  toggleTheme() {
    this.isDarkTheme.next(!this.isDarkTheme.value);
    this.updateTheme();
  }

  private setTheme(isDark: boolean) {
    this.isDarkTheme.next(isDark);
    this.updateTheme();
  }

  private updateTheme() {
    const isDark = this.isDarkTheme.value;
    document.documentElement.style.setProperty('--text', isDark ? '#FFFFFF' : '#1A1B1E');
    document.documentElement.style.setProperty('--background', isDark ? '#1A1B1E' : '#FFFFFF');
    document.documentElement.style.setProperty('--surface', isDark ? '#25262B' : '#F1F3F5');
    document.documentElement.style.setProperty('--border', isDark ? '#2C2E33' : '#E9ECEF');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
} 