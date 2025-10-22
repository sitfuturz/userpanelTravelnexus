import { Injectable, Inject } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';

// Interfaces for Event History
export interface EventSpeaker {
  _id: string;
  name: string;
  photo: string;
  bio: string;
}

export interface EventOrganizer {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface PaymentDetails {
  _id: string;
  status: string;
  amount: number;
  paymentMethod: string;
  isApproved: boolean;
  transactionId: string;
  paymentScreenshotUrl?: string;
  createdAt: string;
  refundDetails?: any;
}

export interface EventRegistration {
  _id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  ticketType: string;
  registeredAt: string;
  payment: PaymentDetails;
}

export interface EventRegistrationData {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  bannerImage: string;
  eventType: 'online' | 'offline';
  capacity: number;
  isPaid: boolean;
  ticketPrice: number;
  organizer: EventOrganizer;
  speakers: EventSpeaker[];
  registrations: EventRegistration[];
  totalRegistrations: number;
  createdAt: string;
}

export interface EventHistoryResponse {
  success: boolean;
  message: string;
  data: {
    events: EventRegistrationData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: {
      paymentStatus: string;
      registrationStatus: string;
    };
  };
}

export interface GetUserEventsParams {
  page?: number;
  limit?: number;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  registrationStatus?: 'pending' | 'confirmed' | 'cancelled';
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventHistoryService {
  private headers: any[] = [];

  constructor(@Inject(ApiManager) private apiManager: ApiManager) {}

  private getHeaders(): void {
    this.headers = [];
    const token = localStorage.getItem('token');
    if (token) {
      this.headers.push({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
  }

  async getUserEvents(params: GetUserEventsParams): Promise<EventHistoryResponse> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.events.getUserEvents,
          method: 'POST'
        },
        {
          page: params.page || 1,
          limit: params.limit || 10,
          paymentStatus: params.paymentStatus,
          registrationStatus: params.registrationStatus,
          userId: params.userId
        },
        this.headers
      );

      return response as EventHistoryResponse;
    } catch (error: any) {
      console.error('Get User Events Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch event history', 'error');
      throw error;
    }
  }
}
