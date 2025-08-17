/**
 * DEPRECATED - DataStorage Class
 * 
 * This class was used for localStorage-based data persistence with mock JSON data.
 * All services have been refactored to use backend APIs exclusively.
 * 
 * This file will be removed in a future version.
 * Please update any remaining imports to use the new service structure.
 */

export class DataStorage {
  static saveApplications<T>(applications: T[]): never {
    throw new Error('DataStorage.saveApplications is deprecated. Services now use backend APIs exclusively.');
  }

  static loadApplications<T>(): never {
    throw new Error('DataStorage.loadApplications is deprecated. Services now use backend APIs exclusively.');
  }

  static saveGrantCalls<T>(grantCalls: T[]): never {
    throw new Error('DataStorage.saveGrantCalls is deprecated. Services now use backend APIs exclusively.');
  }

  static loadGrantCalls<T>(): never {
    throw new Error('DataStorage.loadGrantCalls is deprecated. Services now use backend APIs exclusively.');
  }

  static initializeFromJSON<T>(key: string, jsonData: T[]): never {
    throw new Error('DataStorage.initializeFromJSON is deprecated. Services now use backend APIs exclusively.');
  }

  static clearAll(): never {
    throw new Error('DataStorage.clearAll is deprecated. Services now use backend APIs exclusively.');
  }

  static hasApplications(): never {
    throw new Error('DataStorage.hasApplications is deprecated. Services now use backend APIs exclusively.');
  }

  static hasGrantCalls(): never {
    throw new Error('DataStorage.hasGrantCalls is deprecated. Services now use backend APIs exclusively.');
  }
}