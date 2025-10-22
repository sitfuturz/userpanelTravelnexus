import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface AttendanceEvent {
  _id: string;
  name: string;
  event_or_meeting?: 'event' | 'meeting';
  paid?: boolean;
  thumbnail?: string;
  date: string;
}

export interface AttendanceRecord {
  event: AttendanceEvent;
  createdAt: string | null;
  status: 'Present' | 'Absent';
}

export interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  chapter: string;
}

export interface AttendanceResponse {
  message: string;
  data: {
    docs: AttendanceRecord[];
    summary: AttendanceSummary;
  };
  status: number;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
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
   * Get all attendance records for user
   */
  async getAllAttendance(): Promise<any> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.attendance.getAllAttendance}/${userId}`,
          method: 'GET',
        },
        {},
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Get Attendance Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch attendance data', 'error');
      throw error;
    }
  }
}