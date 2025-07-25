export class DataStorage {
  private static setItem<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  private static hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  static saveApplications<T>(applications: T[]): void {
    this.setItem('applications', applications);
  }

  static loadApplications<T>(fallback: T[]): T[] {
    const stored = this.getItem<T[]>('applications');
    return stored || fallback;
  }

  static saveGrantCalls<T>(calls: T[]): void {
    this.setItem('grantCalls', calls);
  }

  static loadGrantCalls<T>(fallback: T[]): T[] {
    const stored = this.getItem<T[]>('grantCalls');
    return stored || fallback;
  }

  static hasPersistentData(): boolean {
    return this.hasItem('applications') || this.hasItem('grantCalls');
  }

  static initializeFromJSON<T>(key: string, jsonData: T[]): T[] {
    if (!this.hasItem(key)) {
      this.setItem(key, jsonData);
    }
    return this.getItem<T[]>(key) || jsonData;
  }
}