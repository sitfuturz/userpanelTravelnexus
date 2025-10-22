// dashboard.component.ts - Updated with sidebar design but keeping your API implementation
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomerAuthService, DashboardService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { EventHistoryService } from '../../../services/event-history.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { common } from '../../../core/constants/common';
import { SidebarStateService } from '../../../services/sidebar-state.service';

interface DashboardData {
  referralGiven: number;
  referralReceived: number;
  oneToOne: number;
  visitor: number;
  tyfcbTotalAmount: number;
  tyfcbGiven: number;
  tyfcbReceived: number;
  testimonial: number;
  timeFilter: string;
  currentMonth: string | null;
}

interface EventCounts {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  countsByPaymentStatus: {
    pending: number;
    completed: number;
    failed: number;
  };
  countsByRegistrationStatus: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  countsByEventType: {
    online: number;
    offline: number;
    hybrid: number;
  };
}

interface NextEvent {
  _id: string;
  name: string;
  event_or_meeting: string;
  date: string;
  mode: string;
  amount: number | null;
  startTime: string;
  endTime: string;
  paid: boolean;
  thumbnail: string;
  details: string;
  photos: string[];
  videos: string[];
  mapURL: string;
  location: string;
  chapter_name: string;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  _id: string;
  title: string;
  description: string;
  userId: string;
  triggeredBy: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileCompletion {
  isProfileCompleted: boolean;
  profileCompletionPercentage: number;
}

interface Testimonial {
  _id: string;
  giverId?: {
    _id: string;
    name: string;
    chapter_name: string;
    email: string;
    profilePic: string;
    business: any[];
  } | null;
  receiverId: string;
  date: string | null;
  message: string;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'] 
})
export class DashboardComponent implements OnInit {
  // Data properties - keeping your existing structure
  dashboardData: DashboardData = {
    referralGiven: 0,
    referralReceived: 0,
    oneToOne: 0,
    visitor: 0,
    tyfcbTotalAmount: 0,
    tyfcbGiven: 0,
    tyfcbReceived: 0,
    testimonial: 0,
    timeFilter: 'all',
    currentMonth: null
  };

  nextEvent: NextEvent | null = null;
  visitorCount: number = 0;
  totalEventsCount: number = 0;
  eventCounts: EventCounts = {
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    countsByPaymentStatus: {
      pending: 0,
      completed: 0,
      failed: 0
    },
    countsByRegistrationStatus: {
      pending: 0,
      confirmed: 0,
      cancelled: 0
    },
    countsByEventType: {
      online: 0,
      offline: 0,
      hybrid: 0
    }
  };
  notifications: Notification[] = [];
  profileCompletion: ProfileCompletion = {
    isProfileCompleted: false,
    profileCompletionPercentage: 0
  };
  testimonials: Testimonial[] = [];
  recentEvents: any[] = [];

  // UI state - keeping your existing + adding sidebar
  selectedTimeFilter: string = '12months';
  isLoading: boolean = true;
  isLoadingEvent: boolean = false;
  isLoadingEventCounts: boolean = false;
  isLoadingNotifications: boolean = false;
  isLoadingProfile: boolean = false;
  isLoadingTestimonials: boolean = false;

  // New properties for sidebar design
  isSidebarOpen = false;
  showNotifications = false;

  // User data
  currentUser: any = null;

  // Expose Math object for template use
  Math = Math;

  constructor(
    private authService: CustomerAuthService,
    private dashboardService: DashboardService,
    private eventService: EventService,
    private eventHistoryService: EventHistoryService,
    private router: Router,
    public sidebarStateService: SidebarStateService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  private async initializeComponent(): Promise<void> {
    try {
      this.currentUser = this.authService.getCurrentUser();
      
      if (!this.currentUser || !this.currentUser._id) {
        await swalHelper.showToast('User data not found. Please login again.', 'error');
        this.authService.logout();
        return;
      }

      // Load all dashboard data - keeping your existing API calls
      await Promise.all([
        this.loadDashboardCounts(),
        this.loadEventCounts(),
        this.loadTotalEventsCount(),
        this.loadNextEvent(),
        this.loadNotifications(),
        this.loadProfileCompletion(),
        this.loadTestimonials()
      ]);

    } catch (error) {
      console.error('Dashboard initialization error:', error);
      await swalHelper.showToast('Failed to load dashboard data', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Load dashboard counts with time filter - keeping your existing API logic
  async loadDashboardCounts(timeFilter: string = 'all'): Promise<void> {
    try {
      const response = await this.dashboardService.getDashboardCounts(this.currentUser._id, timeFilter);

      if (response && response.success && response.data) {
        this.dashboardData = { ...this.dashboardData, ...response.data.data };
      }
    } catch (error) {
      console.error('Error loading dashboard counts:', error);
      // Use dummy data on error - updated to match design
      // this.dashboardData = {
      //   referralGiven: 35,
      //   referralReceived: 60,
      //   oneToOne: 24,
      //   visitor: 5,
      //   tyfcbTotalAmount: 256234,
      //   tyfcbGiven: 195580,
      //   tyfcbReceived: 904561,
      //   testimonial: 21,
      //   timeFilter: timeFilter,
      //   currentMonth: null
      // };
      this.dashboardData = { ...this.dashboardData, timeFilter };
    }
  }

  // Load event counts
  async loadEventCounts(): Promise<void> {
    this.isLoadingEventCounts = true;
    try {
      const response = await this.dashboardService.getUserEventCounts(this.currentUser._id);

      if (response && response.success && response.data) {
        this.eventCounts = response.data;
      }
    } catch (error) {
      console.error('Error loading event counts:', error);
      // Keep default values on error
    } finally {
      this.isLoadingEventCounts = false;
    }
  }

  // Load total events count from events API
  async loadTotalEventsCount(): Promise<void> {
    try {
      const response = await this.eventService.getEvents({
        page: 1,
        limit: 1,
        userId: this.currentUser._id
      });

      if (response && response.success && response.data) {
        this.totalEventsCount = response.data.total || 0;
      }
    } catch (error) {
      console.error('Error loading total events count:', error);
      this.totalEventsCount = 0;
    }
  }

  // Load next nearest event - keeping your existing API logic
  async loadNextEvent(): Promise<void> {
    this.isLoadingEvent = true;
    try {
      const response = await this.dashboardService.getNextNearestEvent(this.currentUser._id);

      if (response && response.success && response.data) {
        this.nextEvent = response.data;
        this.visitorCount = response.visitorCount || 0;
      }
    } catch (error) {
      console.error('Error loading next event:', error);
      // Use dummy data matching design
     this.nextEvent = null;
      this.visitorCount = 0;
    } finally {
      this.isLoadingEvent = false;
    }
  }

  // Load notifications - keeping your existing API logic
  async loadNotifications(): Promise<void> {
    this.isLoadingNotifications = true;
    try {
      const response = await this.dashboardService.getNotifications(this.currentUser._id, 1, 5);

      if (response && response.success && response.data?.docs) {
        this.notifications = response.data.docs;
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Use dummy data matching design
           this.notifications = [];
    } finally {
      this.isLoadingNotifications = false;
    }
  }

  // Load profile completion - keeping your existing API logic
  async loadProfileCompletion(): Promise<void> {
    this.isLoadingProfile = true;
    try {
      const response = await this.dashboardService.getProfileCompletion(this.currentUser._id);

      if (response && response.success && response.data) {
        this.profileCompletion = response.data;
      }
    } catch (error) {
      console.error('Error loading profile completion:', error);
      // Use dummy data matching design
      this.profileCompletion = {
        isProfileCompleted: false,
        profileCompletionPercentage: 0
      };
    } finally {
      this.isLoadingProfile = false;
    }
  }

  // Load testimonials - keeping your existing API logic
  async loadTestimonials(): Promise<void> {
    this.isLoadingTestimonials = true;
    try {
      // Load recent events from getUserEvents API with filter 'all' and limit 5
      const response = await this.eventHistoryService.getUserEvents({
        page: 1,
        limit: 5,
        userId: this.currentUser._id
        // No paymentStatus filter = 'all' by default
      });

      if (response && response.success && response.data?.events) {
        this.recentEvents = response.data.events.slice(0, 5); // Show maximum 5 events
      }
    } catch (error) {
      console.error('Error loading recent events:', error);
      this.recentEvents = [];
    } finally {
      this.isLoadingTestimonials = false;
    }
  }

  // Time filter change handler - keeping your existing logic
  async onTimeFilterChange(filter: string): Promise<void> {
    this.selectedTimeFilter = filter;
    await this.loadDashboardCounts(filter);
  }

  // Format currency - keeping your existing logic
  formatCurrency(amount: number): string {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  }

  // Format date - keeping your existing logic
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  }

  // Format time ago - keeping your existing logic
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

  // New methods for sidebar functionality
  toggleSidebar(): void {
    this.sidebarStateService.toggleSidebar();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  // Navigation methods - keeping your existing logic
  navigateToEvents(): void {
    this.router.navigate(['/event']);
  }

  navigateToAttendance(): void {
    this.router.navigate(['/attendance']);
  }

  navigateToScanCard(): void {
    this.router.navigate(['/scan-card']);
  }

  navigateToComplaints(): void {
    this.router.navigate(['/complaints']);
  }

  navigateToSuggestion(): void {
    this.router.navigate(['/suggestion']);
  }

  navigateToPodcastBooking(): void {
    this.router.navigate(['/podcast-booking']);
  }

  navigateToPodcastStatus(): void {
    this.router.navigate(['/podcast-status']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToGratitude(): void {
    this.router.navigate(['/gratitude']);
  }

  navigateToEventHistory(): void {
    this.router.navigate(['/event-history']);
  }

  // Event-related methods
  getEventImage(event: any): string {
    return event.bannerImage 
      ? `${environment.imageUrl}${event.bannerImage}`
      : 'assets/images/placeholder-image.png';
  }

  getLatestRegistrationStatus(event: any): string {
    if (event.registrations && event.registrations.length > 0) {
      // Get the latest registration (most recent)
      const latestRegistration = event.registrations[event.registrations.length - 1];
      return latestRegistration.status || 'Registered';
    }
    return 'Registered';
  }

  navigateToTestimonials(): void {
    this.router.navigate(['/testimonials']);
  }

  updateProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  // Logout method - keeping your existing logic
  async logout(): Promise<void> {
    await this.authService.logout();
  }
}