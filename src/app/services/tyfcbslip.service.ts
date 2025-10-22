import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface TyfcbData {
  _id: string;
  giverId: {
    _id: string;
    name: string;
    chapter_name: string;
    profilePic: string;
  };
  receiverId: {
    _id: string;
    name: string;
    chapter_name: string;
    profilePic: string;
  };
  referralId?: {
    _id: string;
    referral_type: string;
    referral_status: {
      told_them_you_would_will: boolean;
      given_card: boolean;
    };
    comments: string;
    rating: number;
    giver_id: {
      _id: string;
      name: string;
      profilePic: string;
    };
    receiver_id: {
      _id: string;
      name: string;
      profilePic: string;
    };
  };
  amount: number;
  currency: string;
  referral_type: 'Inside' | 'Outside' | 'Tier3+';
  business_type: 'New' | 'Repeat';
  comments: string;
  createdAt: string;
}

export interface TyfcbResponse {
  success: boolean;
  message: string;
  data: TyfcbData | TyfcbData[];
  docs?: number;
  totalPages?: number;
  page?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface CreateTyfcbRequest {
  giverId?: string;
  receiverId: string;
  referralId?: string;
  amount: number;
  currency: string;
  referral_type: 'Inside' | 'Outside' | 'Tier3+';
  business_type: 'New' | 'Repeat';
  comments?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TyfcbService {
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
   * Create a new TYFCB
   */
  async createTyfcb(tyfcbData: CreateTyfcbRequest): Promise<TyfcbResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const requestData = {
        ...tyfcbData,
        giverId: userId
      };

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.tyfcb.createTyfcb,
          method: 'POST',
        },
        requestData,
        this.headers
      );
      
       swalHelper.showToast(response.message || 'TYFCB created successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Create TYFCB Error:', error);
      await swalHelper.showToast(error.message || 'Failed to create TYFCB', 'error');
      throw error;
    }
  }

  /**
   * Get TYFCB by ID
   */
  async getTyfcbById(tyfcbId: string): Promise<TyfcbResponse> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.tyfcb.getTyfcbById,
          method: 'POST',
        },
        { tyfcbId },
        this.headers
      );
      
       //swalHelper.showToast(response.message || 'TYFCB fetched successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Get TYFCB Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch TYFCB', 'error');
      throw error;
    }
  }

  /**
   * Get TYFCBs given by the current user
   */
  async getTyfcbsByGiverId(page: number = 1, limit: number = 10): Promise<TyfcbResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.tyfcb.getTyfcbsByGiverId}/${userId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
    //   swalHelper.showToast(response.message || 'Given TYFCBs fetched successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Get TYFCBs By GiverId Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch given TYFCBs', 'error');
      throw error;
    }
  }

  /**
   * Get TYFCBs received by the current user
   */
  async getTyfcbsByReceiverId(page: number = 1, limit: number = 10): Promise<TyfcbResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.tyfcb.getTyfcbsByReceiverId}/${userId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
       //swalHelper.showToast(response.message || 'Received TYFCBs fetched successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Get TYFCBs By ReceiverId Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch received TYFCBs', 'error');
      throw error;
    }
  }
}