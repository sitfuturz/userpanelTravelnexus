import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface Testimonial {
  _id: string;
  giverId: {
    _id: string;
    name: string;
    profilePic: string;
  };
  receiverId: {
    _id: string;
    name: string;
    profilePic: string;
  };
  date: string;
  message: string;
  selected: boolean;
  createdAt: string;
}

export interface TestimonialResponse {
  success: boolean;
  message: string;
  data: Testimonial[];
  totalDocs?: number;
  totalPages?: number;
  page?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface User {
  _id: string;
  name: string;
  digitalCardLink: string;
  chapter_name: string;
  city: string;
  state: string;
  country: string;
  mobile_number: string;
  email: string;
  profilePic: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User[];
  docs?: number;
  totalPages?: number;
  page?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface CreateTestimonialRequest {
  giverId: string;
  receiverId: string;
  message: string;
  date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GratitudeService {
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
   * Get testimonials by receiver ID
   */
  async getTestimonialsByReceiverId(receiverId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.gratitude.getTestimonialsByReceiverId}/${receiverId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
       //swalHelper.showToast(response.message || 'Testimonials fetched successfully', 'success');
      return  response;
    } catch (error: any) {
      console.error('Get Testimonials Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch testimonials', 'error');
      throw error;
    }
  }

  /**
   * Get testimonial requests by receiver ID
   */
  async getTestimonialRequestsByReceiverId(receiverId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.gratitude.getTestimonialRequestsByReceiverId}/${receiverId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
       //swalHelper.showToast(response.message || 'Testimonial requests fetched successfully', 'success');
      return  response;
    } catch (error: any) {
      console.error('Get Testimonial Requests Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch testimonial requests', 'error');
      throw error;
    }
  }

  /**
   * Create a new testimonial
   */
  async createTestimonial(testimonialData: CreateTestimonialRequest): Promise<TestimonialResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const requestData = {
        ...testimonialData,
        giverId: userId
      };

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.gratitude.createTestimonial,
          method: 'POST',
        },
        requestData,
        this.headers
      );
      
       // swalHelper.showToast(response.message || 'Testimonial created successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Create Testimonial Error:', error);
      await swalHelper.showToast(error.message || 'Failed to create testimonial', 'error');
      throw error;
    }
  }

  /**
   * Get all users data
   */
  async getAllUsersData(page: number = 1, limit: number = 50): Promise<UserResponse> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.gratitude.getAllUsersData}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      // swalHelper.showToast(response.message || 'Users data fetched successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Get All Users Data Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch users data', 'error');
      throw error;
    }
  }
}