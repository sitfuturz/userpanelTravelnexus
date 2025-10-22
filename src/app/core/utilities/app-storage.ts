import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})

export class AppStorage {
  public set = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public get = (key: string) => {
    let values = localStorage.getItem(key);
    if (values === null || values === undefined || values === 'undefined') {
      return null;
    }
    try {
      return JSON.parse(values);
    } catch (error) {
      console.error(`Error parsing localStorage value for key "${key}":`, error);
      return null;
    }
  }

  public clearKey = (key: string) => localStorage.removeItem(key);
  public clearAll = () => localStorage.clear();
}
