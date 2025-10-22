
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';

import { environment } from 'src/env/env.local';
import { HttpParams } from '@angular/common/http';
export interface LoginRequest {
  mobile_number: number;
  fcm: string;
  deviceId: string;
}

export interface VerifyOtpRequest {
  mobile_number: number;
  otpCode: number;
  deviceId: string;
}

export interface ResendOtpRequest {
  mobile_number: number;
}

export interface LoginResponse {
  message: string;
  data: boolean;
}

export interface VerifyOtpResponse {
  message: string;
  success: boolean;
  user: any;
  token: string;
}

export interface ResendOtpResponse {
  message: string;
  success: boolean;
  sessionId: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root',
})

export class CustomerAuthService {
  private headers: any = [];
  

  
  constructor(
    private apiManager: ApiManager, 
    private storage: AppStorage,
    private router: Router
  ) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  // Generate device ID
  private generateDeviceId(): string {
    return 'customer_web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Send OTP for login
  async sendLoginOtp(mobileNumber: string): Promise<any> {
    try {
      const deviceId = this.generateDeviceId();
      this.storage.set(common.DEVICE_ID, deviceId);

      const payload: LoginRequest = {
        mobile_number: parseInt(mobileNumber),
        fcm: 'customer_web_app',
        deviceId: deviceId
      };
      
      console.log('Sending OTP to API endpoint:', apiEndpoints.auth.login);
      console.log('Payload:', payload);
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.auth.login,
          method: 'POST'
        },
        payload,
        []
      );

      console.log('API Response:', response);

      // Check for successful response - your API returns data directly without status wrapper
      if (response && response.data === true) {
        console.log('OTP sent successfully, showing success message');
        await swalHelper.showToast(response.message || common.SUCCESS_MESSAGES.OTP_SENT, 'success');
        return true;
      }
      
      // Handle error response
      console.log('API response indicates failure');
      const errorMessage = response?.message || common.ERROR_MESSAGES.SERVER_ERROR;
      await swalHelper.showToast(errorMessage, 'error');
      return false;
      
    } catch (error: any) {
      console.error('Send OTP error:', error);
      
      // Handle different types of errors
      let errorMessage = common.ERROR_MESSAGES.NETWORK_ERROR;
      
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      await swalHelper.showToast(errorMessage, 'error');
      return false;
    }
  }

  // Verify OTP and login
  async verifyOtpAndLogin(mobileNumber: string, otp: string): Promise<any> {
    try {
      // Get the stored device ID from login
      const deviceId = this.storage.get(common.DEVICE_ID);
      
      if (!deviceId) {
        console.error('Device ID not found in storage');
        await swalHelper.showToast('Session expired. Please try logging in again.', 'error');
        this.router.navigate(['/login']);
        return false;
      }

      const payload: VerifyOtpRequest = {
        mobile_number: parseInt(mobileNumber),
        otpCode: parseInt(otp),
        deviceId: deviceId
      };

      console.log('Verify OTP Payload:', payload);
    
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.auth.verifyMobile,
          method: 'POST'
        },
        payload,
        []
      );

      console.log('Verify OTP Response:', response);

      // Check if verification was successful - your API returns success: true
      if (response && response.success === true) {
        // Store authentication data
        this.storage.set(common.USER_DATA, response.user);
        console.log("userdata",common.USER_DATA)
        this.storage.set(common.IS_USER_LOGGED_IN, true);
        
        // If your API provides a token in the future, uncomment this line:
         this.storage.set(common.TOKEN, response.token);
        
        await swalHelper.showToast(response.message || common.SUCCESS_MESSAGES.LOGIN_SUCCESS, 'success');
        this.router.navigate(['/dashboard']);
        return true;
      } else {
        await swalHelper.showToast(response.message || common.ERROR_MESSAGES.INVALID_OTP, 'error');
        return false;
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = error?.error?.message || common.ERROR_MESSAGES.INVALID_OTP;
      await swalHelper.showToast(errorMessage, 'error');
      return false;
    }
  }

  // Resend OTP
  async resendOtp(mobileNumber: string): Promise<any> {
    try {
      const payload: ResendOtpRequest = {
        mobile_number: parseInt(mobileNumber)
      };

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.auth.resendOtp,
          method: 'POST'
        },
        payload,
        []
      );

      console.log('Resend OTP Response:', response);

      // Check if resend was successful - adjust based on your API response format
      if (response && response.success=== true) {
        await swalHelper.showToast(response.message || common.SUCCESS_MESSAGES.OTP_SENT, 'success');
        return true;
      } else {
        await swalHelper.showToast(response.message || common.ERROR_MESSAGES.SERVER_ERROR, 'error');
        return false;
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage = error?.error?.message || common.ERROR_MESSAGES.NETWORK_ERROR;
      await swalHelper.showToast(errorMessage, 'error');
      return false;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      this.getHeaders();
      
      // Call logout API (optional - for server-side cleanup)
      await this.apiManager.request(
        {
          url: apiEndpoints.auth.logout,
          method: 'POST'
        },
        {},
        this.headers
      );
    } catch (error) {
      console.log('Logout API error (non-critical):', error);
    } finally {
      // Clear local storage regardless of API call result
      this.storage.clearAll();
      this.router.navigate(['/login']);
      await swalHelper.showToast(common.SUCCESS_MESSAGES.LOGOUT_SUCCESS, 'success');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.storage.get(common.TOKEN);
    const isLoggedIn = this.storage.get(common.IS_USER_LOGGED_IN);
    const userData = this.storage.get(common.USER_DATA);
    
    console.log('Auth check - token:', token);
    console.log('Auth check - isLoggedIn:', isLoggedIn);
    console.log('Auth check - userData:', userData);
    
    // Check for both token and login status, or just login status if no token
    const result = !!(token && isLoggedIn) || !!(isLoggedIn && userData);
    console.log('Auth check - result:', result);
    
    return result;
  }

  // Get current user data
  getCurrentUser(): any {
    return this.storage.get(common.USER_DATA);
  }

  // Get auth token
  getAuthToken(): string | null {
    return this.storage.get(common.TOKEN);
  }

  // Validate mobile number
  validateMobileNumber(mobileNumber: string): boolean {
    if (!mobileNumber || mobileNumber.length !== 10) {
      return false;
    }
    return common.MOBILE_PATTERN.test(mobileNumber);
  }

  // Validate OTP
  validateOtp(otp: string): boolean {
    if (!otp || otp.length !== common.OTP_LENGTH) {
      return false;
    }
    return /^\d{4}$/.test(otp);
  }

  // Auto logout on token expiry
  handleTokenExpiry(): void {
    this.storage.clearAll();
    this.router.navigate(['/login']);
    swalHelper.showToast(common.ERROR_MESSAGES.SESSION_EXPIRED, 'warning');
  }

  // Update user data in storage
  updateUserData(userData: any): void {
    this.storage.set(common.USER_DATA, userData);
  }

  // Get user profile


  // Update FCM token
//   async updateFcmToken(fcmToken: string): Promise<void> {
//     try {
//       this.getHeaders();
      
//       await this.apiManager.request(
//         {
//           url: apiEndpoints.notifications.updateFcm,
//           method: 'POST'
//         },
//         { fcm_token: fcmToken },
//         this.headers
//       );
      
//       this.storage.set(common.FCM_TOKEN, fcmToken);
//     } catch (error) {
//       console.error('Update FCM token error:', error);
//     }
//   }
// }

}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private headers: any[] = [];

  constructor(
    private apiManager: ApiManager,
    private storage: AppStorage
  ) {}

  private getHeaders(): void {
    this.headers = [];
    const token = this.storage.get(common.TOKEN);
    if (token) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  }

  // Get dashboard counts with time filter
  async getDashboardCounts(userId: string, timeFilter: string = 'all'): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.dashboard.getUserDataCounts}/${userId}?timeFilter=${timeFilter}`,
          method: 'GET'
        },
        {},
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Dashboard counts API error:', error);
      throw error;
    }
  }

  // Get next nearest event
  async getNextNearestEvent(userId: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.events.nextNearestEvent,
          method: 'POST'
        },
        { userId: userId },
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Next event API error:', error);
      throw error;
    }
  }

  // Get notifications
  async getNotifications(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.notifications.getNotifications}/${userId}?page=${page}&limit=${limit}`,
          method: 'GET'
        },
        {},
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Notifications API error:', error);
      throw error;
    }
  }

  // Get profile completion
  async getProfileCompletion(userId: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.profile.getProfileCompletion,
          method: 'POST'
        },
        { userId: userId },
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Profile completion API error:', error);
      throw error;
    }
  }

  // Get user event counts
  async getUserEventCounts(userId: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.dashboard.getUserEventCounts,
          method: 'POST'
        },
        { userId: userId },
        this.headers
      );
      return response;
    } catch (error) {
      console.error('User event counts API error:', error);
      throw error;
    }
  }

  // Get testimonials
  async getTestimonials(userId: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.testimonials.getTestimonialByUserId}/${userId}`,
          method: 'GET'
        },
        {},
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Testimonials API error:', error);
      throw error;
    }
  }
}