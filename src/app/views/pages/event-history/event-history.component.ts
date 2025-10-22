import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventHistoryService, EventRegistrationData, EventHistoryResponse } from '../../../services/event-history.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { AppStorage } from '../../../core/utilities/app-storage';
import { common } from '../../../core/constants/common';

@Component({
  selector: 'app-event-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-history.component.html',
  styleUrls: ['./event-history.component.scss']
})
export class EventHistoryComponent implements OnInit {

  environment = environment;
  imageUrl = environment.imageUrl;

  // Data arrays
  events: EventRegistrationData[] = [];
  
  // Filter states
  paymentStatusFilter: 'all' | 'pending' | 'completed' | 'failed' | 'refunded' = 'all';
  
  // Loading states
  isLoading = false;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalDocs = 0;
  itemsPerPage = 10;

  // Expose Math object for template use
  Math = Math;

  constructor(
    private eventHistoryService: EventHistoryService,
    private storage: AppStorage
  ) {}

  ngOnInit(): void {
    this.loadEventHistory();
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

  // Load event history
  async loadEventHistory(): Promise<void> {
    this.isLoading = true;
    try {
      const userId = this.getUserIdFromToken();
      const response: EventHistoryResponse = await this.eventHistoryService.getUserEvents({
        page: this.currentPage,
        limit: this.itemsPerPage,
        userId,
        paymentStatus: this.paymentStatusFilter === 'all' ? undefined : this.paymentStatusFilter
      });
      
      this.events = response.data.events || [];
      this.totalDocs = response.data.total || 0;
      this.totalPages = response.data.totalPages || 1;
    } catch (error) {
      console.error('Error loading event history:', error);
      this.events = [];
    } finally {
      this.isLoading = false;
    }
  }

  // Filter by payment status
  async switchPaymentFilter(filter: 'all' | 'pending' | 'completed' | 'failed' | 'refunded'): Promise<void> {
    this.paymentStatusFilter = filter;
    this.currentPage = 1; // Reset to first page
    await this.loadEventHistory();
  }

  // Pagination methods
  async goToPage(page: number): Promise<void> {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      await this.loadEventHistory();
    }
  }

  async nextPage(): Promise<void> {
    if (this.currentPage < this.totalPages) {
      await this.goToPage(this.currentPage + 1);
    }
  }

  async prevPage(): Promise<void> {
    if (this.currentPage > 1) {
      await this.goToPage(this.currentPage - 1);
    }
  }

  // Utility methods
  getEventImage(event: EventRegistrationData): string {
    return event.bannerImage 
      ? `${this.imageUrl}${event.bannerImage}`
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

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      case 'refunded': return 'status-refunded';
      default: return 'status-default';
    }
  }

  getRegistrationStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  }

  // Pagination helper
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Track by functions for ngFor performance
  trackByEventId(index: number, event: EventRegistrationData): string {
    return event._id;
  }

  trackByRegistrationId(index: number, registration: any): string {
    return registration._id;
  }
}
