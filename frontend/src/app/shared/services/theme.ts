import { Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private currentTheme: 'light' | 'dark' = 'light';
  private readonly themeSig = signal<'light' | 'dark'>(this.currentTheme);

  constructor() {
    this.loadTheme();
  }

  /**
   * Load theme from localStorage or system preference
   */
  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark' | null;

    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      // Check system preference
      this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    this.applyTheme(this.currentTheme);
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${theme}-mode`);
    this.themeSig.set(theme);
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    localStorage.setItem(this.THEME_KEY, this.currentTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    this.applyTheme(this.currentTheme);
    localStorage.setItem(this.THEME_KEY, this.currentTheme);
  }

  /**
   * Get current theme
   */
  getTheme(): 'light' | 'dark' {
    return this.themeSig();
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    return this.themeSig() === 'dark';
  }

  /**
   * Reactive theme signal for consumers to subscribe to.
   */
  themeSignal(): Signal<'light' | 'dark'> {
    return this.themeSig;
  }
}
