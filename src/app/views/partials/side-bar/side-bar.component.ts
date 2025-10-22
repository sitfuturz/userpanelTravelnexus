// side-bar.component.ts - Updated to work with new design
import { AppWorker } from './../../../core/workers/app.worker';
import { Component, HostListener, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SideBarService } from './side-bar.service';
import { CommonModule } from '@angular/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { CustomerAuthService } from 'src/app/services/auth.service';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private router: Router,
    private storage: AppStorage,
    private authService: CustomerAuthService,
    public sideBarService: SideBarService,
    public appWorker: AppWorker,
    private sidebarStateService: SidebarStateService
  ) {}

  isSidebarOpen = false;
  isMobile = false;
  activeSubMenuIndex: number | null = null;
  private subscriptions: Subscription[] = [];

  // Icon mapping from Feather to Font Awesome - Updated for Figma design
  private iconMap: { [key: string]: string } = {
    'home': 'fas fa-home',
    'user-plus': 'fas fa-user-plus',
    'users': 'fas fa-users',
    'file-text': 'fas fa-file-alt',
    'calendar-check': 'fas fa-calendar-check',
    'file-import': 'fas fa-file-import',
    'globe': 'fas fa-globe',
    'map': 'fas fa-map',
    'map-pin': 'fas fa-map-marker-alt',
    'layers': 'fas fa-layer-group',
    'tag': 'fas fa-tag',
    'list': 'fas fa-list',
    'banner': 'fas fa-flag',
    'award': 'fas fa-trophy',
    'clipboard-list': 'fas fa-clipboard-list',
    'lock': 'fas fa-lock',
    'calendar': 'fas fa-calendar-alt',
    'check-circle': 'fas fa-check-circle',
    'check-square': 'fas fa-check-square',
    'corner-up-right': 'fas fa-external-link-alt',
    'corner-down-left': 'fas fa-reply',
    'message-square': 'fas fa-comment',
    'user-check': 'fas fa-user-check',
    'trending-up': 'fas fa-chart-line',
    'user': 'fas fa-user',
    'question-circle': 'fas fa-question-circle',
    'history': 'fas fa-history',
    'clipboard': 'fas fa-clipboard',
    'credit-card': 'fas fa-credit-card',
    'cog': 'fas fa-cog',
    'log-out': 'fas fa-sign-out-alt',
    'key': 'fas fa-key',
    'settings': 'fas fa-cogs',
    'layout': 'fas fa-th-large',
    'bar-chart': 'fas fa-chart-bar',
    'podcast': 'fas fa-podcast',
    'chevron-down': 'fas fa-chevron-down',
    'chevron-right': 'fas fa-chevron-right',
    'user-cog': 'fas fa-user-cog',
    'bell': 'fas fa-bell',
    'rss': 'fas fa-rss',
    'trophy': 'fas fa-trophy'
  };

  ngOnInit() {
    console.log('SideBarComponent: ngOnInit called');
    
    // Subscribe to sidebar state changes
    this.subscriptions.push(
      this.sidebarStateService.sidebarOpen$.subscribe(isOpen => {
        console.log('SideBarComponent: Received sidebar state change:', isOpen);
        this.isSidebarOpen = isOpen;
        this.updateBodyClass();
      })
    );

    this.subscriptions.push(
      this.sidebarStateService.isMobile$.subscribe(isMobile => {
        console.log('SideBarComponent: Received mobile state change:', isMobile);
        this.isMobile = isMobile;
      })
    );

    console.log('SideBarComponent: Initial state - isMobile:', this.isMobile, 'isSidebarOpen:', this.isSidebarOpen);
  }

  ngAfterViewInit() {
    // Component is ready
    console.log('Sidebar component ready - isMobile:', this.isMobile, 'isSidebarOpen:', this.isSidebarOpen);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Clean up body class
    document.body.classList.remove('sidebar-open');
  }

  // Update body class for better mobile sidebar control
  updateBodyClass() {
    if (this.isMobile && this.isSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    // Debug logging
    const sidebarElement = document.getElementById('sidebar');
    console.log('Sidebar state update:', {
      isMobile: this.isMobile,
      isSidebarOpen: this.isSidebarOpen,
      bodyClass: document.body.className,
      sidebarElement: sidebarElement,
      sidebarClasses: sidebarElement?.className,
      sidebarStyle: sidebarElement?.style.cssText,
      computedStyle: sidebarElement ? window.getComputedStyle(sidebarElement).transform : 'N/A'
    });
  }

  toggleSidebar() {
    this.sidebarStateService.toggleSidebar();
    
    // Debug: Force sidebar visibility
    setTimeout(() => {
      const sidebarElement = document.getElementById('sidebar');
      if (sidebarElement && this.isMobile) {
        if (this.isSidebarOpen) {
          // Remove all conflicting styles first
          sidebarElement.style.removeProperty('transform');
          sidebarElement.style.removeProperty('display');
          sidebarElement.style.removeProperty('visibility');
          sidebarElement.style.removeProperty('opacity');
          sidebarElement.style.removeProperty('z-index');
          
          // Force apply styles with !important
          sidebarElement.style.setProperty('transform', 'translateX(0)', 'important');
          sidebarElement.style.setProperty('display', 'block', 'important');
          sidebarElement.style.setProperty('visibility', 'visible', 'important');
          sidebarElement.style.setProperty('opacity', '1', 'important');
          sidebarElement.style.setProperty('z-index', '1042', 'important');
          sidebarElement.style.setProperty('position', 'fixed', 'important');
          sidebarElement.style.setProperty('left', '0', 'important');
          sidebarElement.style.setProperty('top', '0', 'important');
          sidebarElement.style.setProperty('width', '280px', 'important');
          sidebarElement.style.setProperty('min-width', '280px', 'important');
          sidebarElement.style.setProperty('max-width', '85vw', 'important');
          sidebarElement.style.setProperty('height', '100vh', 'important');
          sidebarElement.style.setProperty('transition', 'none', 'important');
          sidebarElement.style.setProperty('margin', '0', 'important');
          sidebarElement.style.setProperty('padding', '0', 'important');
        } else {
          sidebarElement.style.setProperty('transform', 'translateX(-100%)', 'important');
        }
        console.log('Forced sidebar styles:', sidebarElement.style.cssText);
        console.log('Computed transform:', window.getComputedStyle(sidebarElement).transform);
      }
    }, 100);
  }

  closeSidebar() {
    if (this.isMobile) {
      this.sidebarStateService.closeSidebar();
    }
  }

  // Method to get Font Awesome class for given icon name
  getIconClass(iconName: string): string {
    return this.iconMap[iconName] || 'fas fa-circle';
  }

  // Enhanced submenu handling
  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }
    console.log('Submenu toggled - activeIndex:', this.activeSubMenuIndex);
  }

  // Check if submenu is active
  isSubMenuActive(index: number): boolean {
    return this.activeSubMenuIndex === index;
  }

  // Enhanced navigation with automatic sidebar closing
  navigateToRoute(link: string, queryParams?: any) {
    console.log('Navigating to:', link, 'with params:', queryParams);
    this.router.navigate([link], { queryParams: queryParams || {} });
    this.closeSidebar();
  }

  // Check if any submenu item is active
  isParentMenuActive(submenu: any[]): boolean {
    return submenu.some(item => this.router.url.includes(item.link));
  }

  // Enhanced logout with confirmation
  logout = async () => {
    let confirm = await swalHelper.confirmation(
      'Logout',
      'Do you really want to logout?',
      'question'
    );
    if (confirm.isConfirmed) {
      await this.authService.logout();
    }
  };

  // Helper method to check if current route is active
  isRouteActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  // Method to handle keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Close sidebar on Escape key
    if (event.key === 'Escape' && this.isMobile && this.isSidebarOpen) {
      this.closeSidebar();
    }
  }

  // Method to handle outside clicks
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.mobile-toggle-btn');
    
    // Close sidebar if clicking outside on mobile
    if (this.isMobile && this.isSidebarOpen && sidebar && toggleBtn) {
      if (!sidebar.contains(target) && !toggleBtn.contains(target)) {
        this.closeSidebar();
      }
    }
  }

  // Method to handle touch gestures for mobile
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (this.isMobile && this.isSidebarOpen) {
      this.touchStartX = event.touches[0].clientX;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.isMobile && this.isSidebarOpen && this.touchStartX) {
      const touchCurrentX = event.touches[0].clientX;
      const touchDiff = this.touchStartX - touchCurrentX;
      
      // If swiping left (closing gesture)
      if (touchDiff > 50) {
        this.closeSidebar();
        this.touchStartX = null;
      }
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.touchStartX = null;
  }

  private touchStartX: number | null = null;
}