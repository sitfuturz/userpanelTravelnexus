import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface ReferralData {
  _id: string;
  giver_id: {
    _id: string;
    name: string;
    mobile_number: string;
    email: string;
    profilePic: string;
  };
  receiver_id: string;
  referral_type: string;
  referral_status: {
    told_them_you_would_will: boolean;
    given_card: boolean;
  };
  referral: string;
  mobile_number: string;
  address: string;
  comments: string;
  business_name: string;
  rating: number;
  createdAt: string;
  __v: number;
}

export interface ReferralResponse {
  success: boolean;
  message: string;
  data: ReferralData[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  profilePic: string;
  chapter_name: string;
  business_name: string;
  address: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  docs: User[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface CreateReferralRequest {
  giver_id?: string;
  receiver_id: string;
  referral_type: 'inside' | 'outside';
  referral_status: {
    told_them_you_would_will: boolean;
    given_card: boolean;
  };
  referral?: string;
  mobile_number: string;
  address?: string;
  comments?: string;
  business_name?: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
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
   * Get given referrals for the current user
   */
  async getGivenReferrals(page: number = 1, limit: number = 20): Promise<any> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.referrals.getGivenReferral}/${userId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
    // swalHelper.showToast(response.message || 'Given referrals fetched successfully', 'success');
      return  response;
    } catch (error: any) {
      console.error('Get Given Referrals Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch given referrals', 'error');
      throw error;
    }
  }

  /**
   * Get received referrals for the current user
   */
  async getReceivedReferrals(page: number = 1, limit: number = 20): Promise<any> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.referrals.getReceivedReferral}/${userId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
       //swalHelper.showToast(response.message || 'Received referrals fetched successfully', 'success');
      return  response;
    } catch (error: any) {
      console.error('Get Received Referrals Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch received referrals', 'error');
      throw error;
    }
  }

  /**
   * Get list of inside users (same chapter)
   */
  async getInsideUsers(page: number = 1, limit: number = 50): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.referrals.getInsideUsers}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
       //swalHelper.showToast(response.message || 'Inside users fetched successfully', 'success');
      return  response;
    } catch (error: any) {
      console.error('Get Inside Users Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch inside users', 'error');
      throw error;
    }
  }

  /**
   * Get list of outside users (cross-chapter)
   */
  async getOutsideUsers(page: number = 1, limit: number = 50): Promise<UserResponse> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.referrals.getOutsideUsers}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      // swalHelper.showToast(response.message || 'Outside users fetched successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Get Outside Users Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch outside users', 'error');
      throw error;
    }
  }

  /**
   * Create a new referral
   */
  async createReferral(referralData: CreateReferralRequest): Promise<any> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const requestData = {
        ...referralData,
        giver_id: userId
      };

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.referrals.createReferral,
          method: 'POST',
        },
        requestData,
        this.headers
      );
      
       swalHelper.showToast(response.message || 'Referral created successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Create Referral Error:', error);
      await swalHelper.showToast(error.message || 'Failed to create referral', 'error');
      throw error;
    }
  }

  /**
   * Get all users (both inside and outside) with search and pagination
   */
  async getAllUsers(searchTerm: string = '', page: number = 1, limit: number = 20): Promise<{ inside: UserResponse, outside: UserResponse }> {
    try {
      const [insideUsers, outsideUsers] = await Promise.all([
        this.getInsideUsers(page, limit),
        this.getOutsideUsers(page, limit)
      ]);

      return {
        inside: insideUsers,
        outside: outsideUsers
      };
    } catch (error: any) {
      console.error('Get All Users Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch users', 'error');
      throw error;
    }
  }

  /**
   * Update an existing referral
   */
  async updateReferral(referralId: string, referralData: Partial<CreateReferralRequest>): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.referrals.updateReferral}/${referralId}`,
          method: 'PUT',
        },
        referralData,
        this.headers
      );
      
       swalHelper.showToast(response.message || 'Referral updated successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Update Referral Error:', error);
      await swalHelper.showToast(error.message || 'Failed to update referral', 'error');
      throw error;
    }
  }

  /**
   * Delete a referral
   */
  async deleteReferral(referralId: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.referrals.deleteReferral}/${referralId}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );
      
       swalHelper.showToast(response.message || 'Referral deleted successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Delete Referral Error:', error);
      await swalHelper.showToast(error.message || 'Failed to delete referral', 'error');
      throw error;
    }
  }

  /**
   * Get referral statistics
   */
  async getReferralStats(): Promise<any> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.referrals.getReferralStats}/${userId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
       swalHelper.showToast(response.message || 'Referral stats fetched successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Get Referral Stats Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch referral statistics', 'error');
      throw error;
    }
  }
}