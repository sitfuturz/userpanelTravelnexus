import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(false);
  public sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  private isMobileSubject = new BehaviorSubject<boolean>(false);
  public isMobile$ = this.isMobileSubject.asObservable();

  constructor() {
    // Initialize with proper default state
    this.initializeState();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private initializeState(): void {
    const isMobile = window.innerWidth < 992;
    console.log('SidebarStateService: Initializing state - window width:', window.innerWidth, 'isMobile:', isMobile);
    
    this.isMobileSubject.next(isMobile);
    
    // Set initial sidebar state - open on desktop, closed on mobile
    const shouldOpen = !isMobile;
    console.log('SidebarStateService: Setting initial sidebar state to:', shouldOpen);
    this.sidebarOpenSubject.next(shouldOpen);
  }

  private checkScreenSize(): void {
    const isMobile = window.innerWidth < 992;
    const wasOpen = this.sidebarOpenSubject.value;
    
    this.isMobileSubject.next(isMobile);
    
    // Auto-open sidebar on desktop, but respect user's choice on mobile
    if (!isMobile && !wasOpen) {
      this.sidebarOpenSubject.next(true);
    } else if (isMobile && wasOpen) {
      this.sidebarOpenSubject.next(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.value);
  }

  openSidebar(): void {
    this.sidebarOpenSubject.next(true);
  }

  closeSidebar(): void {
    this.sidebarOpenSubject.next(false);
  }

  get isSidebarOpen(): boolean {
    return this.sidebarOpenSubject.value;
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }
}