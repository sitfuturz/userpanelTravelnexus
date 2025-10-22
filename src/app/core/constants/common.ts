import { ViewChild } from '@angular/core';


class Common {
  constructor() {}
  
  // Token keys for customer panel
  public TOKEN: string = 'userToken';
  public USER_DATA: string = 'userData';
  public IS_USER_LOGGED_IN: string = 'isUserLoggedIn';
  public DEVICE_ID: string = 'deviceId';
  public FCM_TOKEN: string = 'fcmToken';
  
  //
  // Customer specific constants
  public APP_NAME: string = 'GBS Customer';
  public APP_VERSION: string = '1.0.0';
  
  // OTP Configuration
  public OTP_LENGTH: number = 4;
  public OTP_RESEND_TIMEOUT: number = 30000; // seconds
  
  // Validation patterns
  public MOBILE_PATTERN: RegExp = /^[6-9]\d{9}$/;
  public EMAIL_PATTERN: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Error messages
  public ERROR_MESSAGES = {
    INVALID_MOBILE: 'Please enter a valid 10-digit mobile number',
    INVALID_OTP: 'Please enter a valid 4-digit OTP',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    UNAUTHORIZED: 'You are not authorized to access this resource.',
    SERVER_ERROR: 'Something went wrong. Please try again later.'
  };
  
  // Success messages
  public SUCCESS_MESSAGES = {
    OTP_SENT: 'OTP sent successfully to your mobile number',
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
    PROFILE_UPDATED: 'Profile updated successfully'
  };
}

export let common = new Common();