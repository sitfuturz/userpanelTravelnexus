import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface Complaint {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  title: string;
  details: string;
  category: 'general' | 'technical' | 'account' | 'other';
  image?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  adminResponse?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ComplaintResponse {
  success: boolean;
  message: string;
  status?: number;
  data?: {
    docs?: Complaint[];
    complaint?: Complaint;
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
export class ComplaintService {
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
   * Create a new complaint
   * @param formData FormData containing complaint details and optional image
   */
  async createComplaint(formData: FormData): Promise<any> {
    try {
      this.getHeaders(true); // true for FormData
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.complaint.createComplaint || 'http://localhost:3200/mobile/createComplaint',
          method: 'POST',
        },
        formData,
        this.headers
      );
      
      if (response.success) {
        await swalHelper.showToast(response.message || 'Complaint created successfully', 'success');
      }
      
      return response;
    } catch (error: any) {
      console.error('Create Complaint Error:', error);
      await swalHelper.showToast(error.message || 'Failed to create complaint', 'error');
      throw error;
    }
  }

  /**
   * Get complaints for a specific user
   * @param userId User ID to fetch complaints for
   * @param page Page number for pagination
   * @param limit Number of items per page
   */
  async getComplaints(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      this.getHeaders(false);
      
      const url = `${apiEndpoints.complaint.getComplaints || 'http://localhost:3200/mobile/getComplaints'}?userId=${userId}&page=${page}&limit=${limit}`;
      
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
      console.error('Get Complaints Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch complaints', 'error');
      throw error;
    }
  }

  /**
   * Get a single complaint by ID
   * @param complaintId Complaint ID to fetch
   */
  async getComplaintById(complaintId: string): Promise<any> {
    try {
      this.getHeaders(false);
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.complaint.getComplaintById || 'http://localhost:3200/mobile/getComplaint'}/${complaintId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Get Complaint By ID Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch complaint details', 'error');
      throw error;
    }
  }

  /**
   * Update complaint status (if needed for admin functionality)
   * @param complaintId Complaint ID to update
   * @param status New status for the complaint
   * @param adminResponse Optional admin response
   */
  async updateComplaintStatus(
    complaintId: string, 
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
          url: `${apiEndpoints.complaint.updateComplaint || 'http://localhost:3200/mobile/updateComplaint'}/${complaintId}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      
      if (response.success) {
        await swalHelper.showToast(response.message || 'Complaint updated successfully', 'success');
      }
      
      return response;
    } catch (error: any) {
      console.error('Update Complaint Error:', error);
      await swalHelper.showToast(error.message || 'Failed to update complaint', 'error');
      throw error;
    }
  }

  /**
   * Delete a complaint (if needed)
   * @param complaintId Complaint ID to delete
   */
  async deleteComplaint(complaintId: string): Promise<any> {
    try {
      this.getHeaders(false);
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.complaint.deleteComplaint || 'http://localhost:3200/mobile/deleteComplaint'}/${complaintId}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );
      
      if (response.success) {
        await swalHelper.showToast(response.message || 'Complaint deleted successfully', 'success');
      }
      
      return response;
    } catch (error: any) {
      console.error('Delete Complaint Error:', error);
      await swalHelper.showToast(error.message || 'Failed to delete complaint', 'error');
      throw error;
    }
  }

  /**
   * Get complaint statistics for dashboard (if needed)
   * @param userId User ID to get statistics for
   */
  async getComplaintStats(userId: string): Promise<any> {
    try {
      this.getHeaders(false);
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.complaint.getComplaintStats || 'http://localhost:3200/mobile/complaintStats'}?userId=${userId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Get Complaint Stats Error:', error);
      throw error;
    }
  }
}
