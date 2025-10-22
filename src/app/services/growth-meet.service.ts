import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface GrowthMeet {
  _id: string;
  initiatedBy: {
    _id: string;
    name: string;
    profilePic: string;
  };
  memberId1: {
    _id: string;
    name: string;
    profilePic: string;
    designation?: string;
  };
  memberId2: {
    _id: string;
    name: string;
    profilePic: string;
    designation?: string;
  };
  date: string;
  meet_place: string;
  topics: string;
  photo?: string;
  createdAt: string;
}

export interface GrowthMeetResponse {
  success: boolean;
  message: string;
  data: GrowthMeet[];
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
  profilePic: string;
  chapter_name: string;
  designation?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User[];
  docs?: User[];
  totalDocs?: number;
  totalPages?: number;
}

export interface CreateGrowthMeetRequest {
  memberId1: string;
  memberId2: string;
  initiatedBy: string;
  date: string;
  location: string;
  topics: string;
  photo?: File;
}

@Injectable({
  providedIn: 'root'
})
export class GrowthMeetService {
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
   * Get initiated one-to-one meetings
   */
  async getInitiatedOneToOne(page: number = 1, limit: number = 10): Promise<GrowthMeetResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.growthMeet.getInitiatedOneToOne}/${userId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error: any) {
      console.error('Get Initiated Growth Meets Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch growth meets', 'error');
      throw error;
    }
  }

  /**
   * Get growth meets initiated by others
   */
  async getInitiatedByOthers(page: number = 1, limit: number = 10): Promise<GrowthMeetResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.growthMeet.getInitiatedByOthers}/${userId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error: any) {
      console.error('Get Growth Meets by Others Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch growth meets', 'error');
      throw error;
    }
  }

  /**
   * Create a new growth meet with FormData (for photo upload)
   */
  async createGrowthMeet(formData: FormData): Promise<GrowthMeetResponse> {
    try {
      const token = this.storage.get(common.TOKEN);
      if (!token) {
        throw new Error('No authentication token found');
      }

      // For FormData, we don't set Content-Type header - browser will set it automatically with boundary
      const headers = [{ 
        Authorization: `Bearer ${token}`
      }];

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.growthMeet.createGrowthMeet,
          method: 'POST',
        },
        formData,
        headers
      );
      
       swalHelper.showToast(response.message || 'Growth meet created successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Create Growth Meet Error:', error);
      await swalHelper.showToast(error.message || 'Failed to create growth meet', 'error');
      throw error;
    }
  }

  /**
   * Get all users for member selection
   */
  async getAllUsers(page: number = 1, limit: number = 100): Promise<UserResponse> {
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
      
      return response.data || response;
    } catch (error: any) {
      console.error('Get All Users Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch users', 'error');
      throw error;
    }
  }


}