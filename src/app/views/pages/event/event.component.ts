import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  EventService, 
  Event, 
  EventResponse, 
  EventSpeaker,
  EventSponsor,
  EventGalleryItem
} from '../../../services/event.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { AppStorage } from '../../../core/utilities/app-storage';
import { common } from '../../../core/constants/common';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

  environment = environment;imageUrl = environment.imageUrl;

  // Filter state
  activeFilter: 'upcoming' | 'recent' | 'all' = 'all';
  
  // Data arrays
  allEvents: Event[] = [];
  filteredEvents: Event[] = [];
  
  // Loading states
  isLoading = false;
  
  // Modal states
  showDetailModal = false;
  selectedEvent: Event | null = null;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalDocs = 0;
  itemsPerPage = 10;

  constructor(
    private eventService: EventService,
    private storage: AppStorage
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  // Get user ID from token
  private getUserIdFromToken(): string {
    const token = this.storage.get(common.TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      throw new Error('Invalid authentication token');
    }
  }

  // Load all events
  async loadEvents(): Promise<void> {
    this.isLoading = true;
    try {
      const userId = this.getUserIdFromToken();
      const response: EventResponse = await this.eventService.getEvents({
        page: this.currentPage,
        limit: this.itemsPerPage,
        userId
      });
      
      this.allEvents = response.data.events || [];
      this.totalDocs = response.data.total || 0;
      this.totalPages = response.data.totalPages || 1;
      
      // Apply filter
      this.applyFilter();
    } catch (error) {
      console.error('Error loading events:', error);
      this.allEvents = [];
      this.filteredEvents = [];
    } finally {
      this.isLoading = false;
    }
  }

  // Switch filter
  switchFilter(filter: 'upcoming' | 'recent' | 'all'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  // Apply filter based on active filter type
  applyFilter(): void {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (this.activeFilter) {
      case 'upcoming':
        this.filteredEvents = this.allEvents.filter(event => {
          const startDate = new Date(event.startDate);
          return startDate >= now;
        });
        break;
      
      case 'recent':
        this.filteredEvents = this.allEvents.filter(event => {
          const endDate = new Date(event.endDate);
          // Event ended within last 7 days
          return endDate >= sevenDaysAgo && endDate <= now;
        });
        break;
      
      case 'all':
        this.filteredEvents = this.allEvents;
        break;
    }
  }

  // Modal methods
  openDetailModal(event: Event): void {
    this.selectedEvent = event;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEvent = null;
  }

  // Utility methods
  getEventImage(event: Event): string {
    return event.bannerImage 
      ? `${this.imageUrl}${event.bannerImage}`
      : 'assets/images/placeholder-image.png';
  }

  getGalleryImage(imagePath: string): string {
    return imagePath 
      ? `${this.imageUrl}${imagePath}`
      : 'assets/images/placeholder-image.png';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${period}`;
  }

  formatEventType(type: string): string {
    if (!type) return 'Event';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  // Get pricing for current user's business type
  getEventPricing(event: Event): Event['filteredPricing'][0] | null {
    if (!event.filteredPricing || event.filteredPricing.length === 0) {
      return null;
    }
    return event.filteredPricing[0];
  }

  // Check if event has gallery content
  hasGalleryContent(event: Event): boolean {
    return event.gallery && event.gallery.length > 0;
  }

  // Get photos from gallery
  getPhotos(event: Event): EventGalleryItem[] {
    return event.gallery?.filter(item => item.type === 'image') || [];
  }

  // Get videos from gallery
  getVideos(event: Event): EventGalleryItem[] {
    return event.gallery?.filter(item => item.type === 'video') || [];
  }

  // Track by functions for ngFor performance
  trackByEventId(index: number, event: Event): string {
    return event._id;
  }

  trackBySpeakerId(index: number, speaker: EventSpeaker): string {
    return speaker._id;
  }

  trackBySponsorId(index: number, sponsor: EventSponsor): string {
    return sponsor._id;
  }

  trackByGalleryId(index: number, item: EventGalleryItem): string {
    return item._id;
  }
}
