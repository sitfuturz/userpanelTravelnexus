import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface EventPricing {
  businessType: 'B2B' | 'B2C';
  ticketPrice: number;
  stayFee: number;
  _id: string;
}

export interface EventSponsor {
  name: string;
  logo: string;
  website: string;
  tier: string;
  description: string;
  contactEmail: string;
  _id: string;
}

export interface EventSpeaker {
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
  };
  name: string;
  bio: string;
  photo: string;
  email: string;
  date: string;
  _id: string;
}

export interface EventGalleryItem {
  type: 'image' | 'video';
  url: string;
  caption: string;
  uploadedAt: string;
  _id: string;
}

export interface Event {
  _id: string;
  organizerId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  mapUrl: string;
  bannerImage: string;
  eventType: 'online' | 'offline';
  capacity: number;
  isPaid: boolean;
  ticketPrice: number;
  stayOption: boolean;
  stayFee: number;
  pricing: EventPricing[];
  sponsors: EventSponsor[];
  schedules: any[];
  speakers: EventSpeaker[];
  registrationLink: string;
  isDeleted: boolean;
  isActive: boolean;
  gallery: EventGalleryItem[];
  registrations: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  filteredPricing: EventPricing[];
}

export interface EventGallery {
  eventId: string;
  name: string;
  date: string;
  thumbnail: string;
  location: string;
  startTime: string;
  endTime: string;
  chapter: string;
  media: {
    photos: string[];
    videos: string[];
  };
}

export interface EventResponse {
  success: boolean;
  message: string;
  data: {
    events: Event[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    businessType: 'B2B' | 'B2C';
  };
}

export interface EventGalleryResponse {
  success: boolean;
  message?: string;
  data: EventGallery;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private headers: any = [];

  constructor(
    private apiManager: ApiManager,
    private storage: AppStorage
  ) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token) {
      this.headers.push({ 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
  };

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

  /**
   * Get all events with pagination
   */
  async getEvents(params: { page?: number; limit?: number; userId?: string }): Promise<EventResponse> {
    try {
      this.getHeaders();
      const userId = params.userId || this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.events.getEvents1,
          method: 'POST',
        },
        {
          page: params.page || 1,
          limit: params.limit || 10,
          userId
        },
        this.headers
      );
      
      return response as EventResponse;
    } catch (error: any) {
      console.error('Get Events Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch events', 'error');
      throw error;
    }
  }

  /**
   * Get all upcoming events (deprecated - use getEvents with filtering)
   */
  async getAllUpcomingEvents(): Promise<EventResponse> {
    return this.getEvents({ page: 1, limit: 100 });
  }

  /**
   * Get all recent events (deprecated - use getEvents with filtering)
   */
  async getAllRecentEvents(): Promise<EventResponse> {
    return this.getEvents({ page: 1, limit: 100 });
  }

  /**
   * Get event gallery by event ID
   */
  async getEventGallery(eventId: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.events.getEventGallery,
          method: 'POST',
        },
        { eventId },
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Get Event Gallery Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch event gallery', 'error');
      throw error;
    }
  }
}