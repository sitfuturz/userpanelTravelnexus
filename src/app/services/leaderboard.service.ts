import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface LeaderboardPoints {
  induction: number;
  visitor: number;
  event_attendance: number;
  tyfcb: number;
  testimonial: number;
  referal: number;
  one_to_one: number;
  attendance_regular: number;
}

export interface LeaderboardUser {
  _id: string;
  userId: string;
  name: string;
  chapter_name: string;
  profilePic?: string;
  one_to_one: number;
  referal: number;
  attendance_regular: number;
  induction: number;
  visitor: number;
  event_attendance: number;
  tyfcb: number;
  testimonial: number;
  totalPointsSum: number;
  leaderboardPoints: LeaderboardPoints;
}

export interface LeaderboardResponse {
  message: string;
  data: {
    docs: LeaderboardUser[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
  status: number;
  success: boolean;
}

export interface LeaderboardFilters {
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
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
   * Get points history / leaderboard data
   */
  async getPointsHistory(filters: LeaderboardFilters = {}): Promise<any> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const requestBody = {
        userId,
        page: filters.page || 1,
        limit: filters.limit || 10,
        fromDate: filters.fromDate,
        toDate: filters.toDate
      };
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.leaderboard.getPointsHistory,
          method: 'POST',
        },
        requestBody,
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Get Points History Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch leaderboard data', 'error');
      throw error;
    }
  }
}