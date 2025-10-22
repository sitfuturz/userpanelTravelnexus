// header.component.ts - Updated to match Figma design and be dynamic
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { CustomerAuthService } from 'src/app/services/auth.service';
import { common } from 'src/app/core/constants/common';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';
import { environment } from 'src/env/env.local';

interface NotificationItem {
  _id: string;
  title: string;
  description: string;
  avatar?: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // User data
  currentUser: any = null;
  
  // Search functionality
  searchQuery: string = '';
   imageurl = environment.imageUrl;
  
  // Dropdown states
  showNotifications: boolean = false;
  showUserMenu: boolean = false;
  
  // Notifications data
  notifications: NotificationItem[] = [];
  unreadNotificationsCount: number = 0;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private storage: AppStorage,
    private router: Router,
    private authService: CustomerAuthService,
    private sidebarStateService: SidebarStateService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load current user data
  loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      // Fallback user data for testing
      this.currentUser = {
        name: 'ARPIT SHAH',
        chapter_name: 'IT Finlay',
        profilePic: null
      };
    }
  }

  // Get user profile image with fallback
  getUserProfileImage(): string {
    if (this.currentUser?.profilePic && this.currentUser.profilePic.trim() !== '') {
      // If profilePic is a full URL, return as is
      if (this.currentUser.profilePic.startsWith('http')) {
        return this.currentUser.profilePic;
      }
      // Return just the relative path since imageurl is already prefixed in template
      return this.currentUser.profilePic;
    }
    return 'assets/images/placeholder-image.png';
  }

  // Load notifications (mock data for now - replace with actual API call)
  loadNotifications(): void {
    // TODO: Replace with actual API call
    this.notifications = [
      {
        _id: '1',
        title: 'Abhilash liked your news',
        description: 'Just now',
        avatar: 'assets/images/avatar1.jpg',
        isRead: false,
        createdAt: new Date().toISOString(),
        type: 'like'
      },
      {
        _id: '2',
        title: 'Sahil comment on your news',
        description: '20m ago',
        avatar: 'assets/images/avatar2.jpg',
        isRead: false,
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        type: 'comment'
      },
      {
        _id: '3',
        title: 'Abhilash liked your news',
        description: '1hr ago',
        avatar: 'assets/images/avatar3.jpg',
        isRead: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        type: 'like'
      },
      {
        _id: '4',
        title: 'New event created: Rim Jim Event',
        description: '2hr ago',
        avatar: 'assets/images/avatar4.jpg',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'event'
      }
    ];
    
    this.updateUnreadCount();
  }

  // Update unread notifications count
  updateUnreadCount(): void {
    this.unreadNotificationsCount = this.notifications.filter(n => !n.isRead).length;
  }

  // Toggle sidebar (mobile)
  toggleSidebar(): void {
    this.sidebarStateService.toggleSidebar();
  }

  // Toggle notifications dropdown
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false; // Close user menu if open
  }

  // Toggle user menu dropdown
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false; // Close notifications if open
  }

  // Close all dropdowns
  closeAllDropdowns(): void {
    this.showNotifications = false;
    this.showUserMenu = false;
  }

  // Search functionality
  onSearch(event: any): void {
    const query = event.target.value;
    console.log('Search query:', query);
    // TODO: Implement search functionality
    // You can emit this to a service or handle it based on current route
  }

  // Mark single notification as read
  markAsRead(notification: NotificationItem): void {
    if (!notification.isRead) {
      notification.isRead = true;
      this.updateUnreadCount();
      // TODO: Call API to mark as read
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    this.updateUnreadCount();
    // TODO: Call API to mark all as read
  }

  // Format time ago
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  // Navigation methods
  navigateToProfile(): void {
    this.closeAllDropdowns();
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    this.closeAllDropdowns();
    this.router.navigate(['/settings']);
  }

  navigateToNotifications(): void {
    this.closeAllDropdowns();
    this.router.navigate(['/notifications']);
  }

  // Logout functionality
  logout = async (): Promise<void> => {
    this.closeAllDropdowns();
    
    const result = await swalHelper.confirmation(
      'Logout',
      'Do you really want to logout?',
      'question'
    );
    
    if (result.isConfirmed) {
      try {
        await this.authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
        // Fallback logout
        this.storage.clearAll();
        this.router.navigate(['/login']);
      }
    }
  };

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const header = document.querySelector('.header');
    
    if (header && !header.contains(target)) {
      this.closeAllDropdowns();
    }
  }

  // Close dropdowns on escape key
  @HostListener('keydown.escape')
  onEscapeKey(): void {
    this.closeAllDropdowns();
  }
}