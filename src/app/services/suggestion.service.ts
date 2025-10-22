import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface Suggestion {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  title: string;
  details: string;
  category: 'general' | 'technical' | 'feature' | 'improvement' | 'other';
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'implemented';
  adminResponse?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface SuggestionResponse {
  success: boolean;
  message: string;
  status?: number;
  data?: {
    docs?: Suggestion[];
    suggestion?: Suggestion;
    totalDocs?: number;
    limit?: number;
    totalPages?: number;
    page?: number;
    pagingCounter?: number;
    hasPrevPage?: boolean;
    hasNextPage?: boolean;
    prevPage?: number | null;
    nextPage?: number | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {
  private headers: any = [];

  constructor(
    private apiManager: ApiManager,
    private storage: AppStorage
  ) {}

  private getHeaders = (isFormData: boolean = false) => {
    this.headers = [];
    const token = this.storage.get(common.TOKEN);
    if (token) {
      if (isFormData) {
        // For FormData, let browser set Content-Type with boundary
        this.headers.push({ 
          Authorization: `Bearer ${token}`
        });
      } else {
        this.headers.push({ 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
      }
    }
  };

  /**
   * Create a new suggestion
   * @param suggestionData Object containing suggestion details
   */
  async createSuggestion(suggestionData: any): Promise<any> {
    try {
      this.getHeaders(false);
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.suggestion?.createSuggestion || 'http://localhost:3200/mobile/createSuggestion',
          method: 'POST',
        },
        suggestionData,
        this.headers
      );
      
      if (response.success) {
        await swalHelper.showToast(response.message || 'Suggestion created successfully', 'success');
      }
      
      return response;
    } catch (error: any) {
      console.error('Create Suggestion Error:', error);
      await swalHelper.showToast(error.message || 'Failed to create suggestion', 'error');
      throw error;
    }
  }

  /**
   * Get suggestions for a specific user
   * @param userId User ID to fetch suggestions for
   * @param page Page number for pagination
   * @param limit Number of items per page
   */
  async getSuggestions(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      this.getHeaders(false);
      
      const url = `${apiEndpoints.suggestion?.getSuggestions || 'http://localhost:3200/mobile/getSuggestions'}?userId=${userId}&page=${page}&limit=${limit}`;
      
      const response = await this.apiManager.request(
        {
          url: url,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Get Suggestions Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch suggestions', 'error');
      throw error;
    }
  }

  /**
   * Get a single suggestion by ID
   * @param suggestionId Suggestion ID to fetch
   */
  async getSuggestionById(suggestionId: string): Promise<any> {
    try {
      this.getHeaders(false);
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.suggestion?.getSuggestionById || 'http://localhost:3200/mobile/getSuggestion'}/${suggestionId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Get Suggestion By ID Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch suggestion details', 'error');
      throw error;
    }
  }

  /**
   * Update suggestion status (if needed for admin functionality)
   * @param suggestionId Suggestion ID to update
   * @param status New status for the suggestion
   * @param adminResponse Optional admin response
   */
  async updateSuggestionStatus(
    suggestionId: string, 
    status: string, 
    adminResponse?: string
  ): Promise<any> {
    try {
      this.getHeaders(false);
      
      const data = {
        status: status,
        adminResponse: adminResponse
      };
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.suggestion?.updateSuggestion || 'http://localhost:3200/mobile/updateSuggestion'}/${suggestionId}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      
      if (response.success) {
        await swalHelper.showToast(response.message || 'Suggestion updated successfully', 'success');
      }
      
      return response;
    } catch (error: any) {
      console.error('Update Suggestion Error:', error);
      await swalHelper.showToast(error.message || 'Failed to update suggestion', 'error');
      throw error;
    }
  }

  /**
   * Delete a suggestion (if needed)
   * @param suggestionId Suggestion ID to delete
   */
  async deleteSuggestion(suggestionId: string): Promise<any> {
    try {
      this.getHeaders(false);
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.suggestion?.deleteSuggestion || 'http://localhost:3200/mobile/deleteSuggestion'}/${suggestionId}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );
      
      if (response.success) {
        await swalHelper.showToast(response.message || 'Suggestion deleted successfully', 'success');
      }
      
      return response;
    } catch (error: any) {
      console.error('Delete Suggestion Error:', error);
      await swalHelper.showToast(error.message || 'Failed to delete suggestion', 'error');
      throw error;
    }
  }

  /**
   * Get suggestion statistics for dashboard (if needed)
   * @param userId User ID to get statistics for
   */
  async getSuggestionStats(userId: string): Promise<any> {
    try {
      this.getHeaders(false);
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.suggestion?.getSuggestionStats || 'http://localhost:3200/mobile/suggestionStats'}?userId=${userId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Get Suggestion Stats Error:', error);
      throw error;
    }
  }
}
