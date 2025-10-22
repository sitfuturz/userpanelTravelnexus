import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface Region {
  _id: string;
  name: string;
  code: string;
  description: string;
  countries: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SocialMedia {
  Facebook: string;
  Instagram: string;
  LinkedIn: string;
  Twitter: string;
  YouTube: string;
  WhatsApp: string;
}

export interface BusinessDetails {
  logo: string;
  banner_image: string;
  business_name: string;
  business_type: 'B2B' | 'B2C';
  primary_business: boolean;
  category: string;
  sub_category: string;
  product: string;
  service: string;
  formation: string;
  establishment: Date | null;
  team_size: number;
  mobile_number: string;
  email: string;
  website: string;
  address: string;
  about_business_details: string;
  _id: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  mobile_number: string;
  email: string;
  business_name: string;
  isActive: boolean;
  isMember: boolean;
  isprivacy: boolean;
  regions: Region[];
  dmc_specializations: string[];
  services_offered: string[];
  date_of_birth: Date | null;
  profilePic: string;
  address: string;
  business: BusinessDetails[];
  SocialMedia: SocialMedia;
  verified: boolean;
  verificationCode: string;
  deviceId: string;
  fcm: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
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
   * Get user profile data
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      this.getHeaders();
      const userId = this.getUserId();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.profile.getUserProfile}/${userId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (error: any) {
      console.error('Get User Profile Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch profile', 'error');
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: any): Promise<UserProfile> {
    try {
      this.getHeaders();
      const userId = this.getUserId();
      
      // Prepare update data
      const updateData: any = {
        id: userId
      };

      // Handle different data types
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          if (key === 'SocialMedia') {
            // Stringify SocialMedia for backend parsing
            updateData[key] = JSON.stringify(profileData[key]);
          } else if (key === 'regions' && Array.isArray(profileData[key])) {
            // Ensure regions are sent as array of IDs
            updateData[key] = profileData[key];
          } else {
            updateData[key] = profileData[key];
          }
        }
      });
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.profile.updateUserProfile,
          method: 'POST',
        },
        updateData,
        this.headers
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update User Profile Error:', error);
      await swalHelper.showToast(error.message || 'Failed to update profile', 'error');
      throw error;
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<string> {
    try {
      this.getHeaders(true); // true for FormData
      const userId = this.getUserId();
      
      const formData = new FormData();
      formData.append('profilePic', file);
      formData.append('id', userId);
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.profile.updateUserProfile,
          method: 'POST',
        },
        formData,
        this.headers
      );
      
      if (response.success && response.data) {
        return response.data.profilePic || '';
      } else {
        throw new Error(response.message || 'Failed to upload profile picture');
      }
    } catch (error: any) {
      console.error('Upload Profile Picture Error:', error);
      await swalHelper.showToast(error.message || 'Failed to upload profile picture', 'error');
      throw error;
    }
  }

  /**
   * Get user ID from token
   */
  private getUserId(): string {
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
   * Get profile from localStorage
   */
  getUserProfileFromStorage(): UserProfile | null {
    try {
      const profileData = this.storage.get('userProfile');
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting profile from storage:', error);
      return null;
    }
  }

  /**
   * Save profile to localStorage
   */
  saveUserProfileToStorage(profile: UserProfile): void {
    try {
      this.storage.set('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile to storage:', error);
    }
  }

  /**
   * Get default avatar URL
   */
  getDefaultAvatar(): string {
    return 'assets/images/placeholder-image.png';
  }

  /**
   * Get primary business
   */
  getPrimaryBusiness(profile: UserProfile): BusinessDetails | null {
    if (!profile.business || profile.business.length === 0) {
      return null;
    }
    
    const primaryBusiness = profile.business.find(b => b.primary_business);
    return primaryBusiness || profile.business[0];
  }

  /**
   * Format full address
   */
  formatFullAddress(profile: UserProfile): string {
    const parts = [
      profile.address,
      profile.city,
      profile.state,
      profile.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ') || 'Not provided';
  }

  /**
   * Get active social media links
   */
  getActiveSocialMediaLinks(socialMedia: SocialMedia): Array<{platform: string, url: string}> {
    const links: Array<{platform: string, url: string}> = [];
    
    Object.entries(socialMedia).forEach(([platform, url]) => {
      if (url && url.trim() !== '') {
        links.push({ platform, url });
      }
    });
    
    return links;
  }

  /**
   * Get available specializations
   */
  getAvailableSpecializations(): string[] {
    return [
      'MICE', 'Adventure', 'Luxury', 'Cultural', 'Corporate',
      'Leisure', 'Educational', 'Medical', 'Religious', 'Eco-Tourism'
    ];
  }

  /**
   * Get available services
   */
  getAvailableServices(): string[] {
    return [
      'Hotel Booking', 'Transportation', 'Guided Tours', 'Event Management',
      'Airport Transfers', 'Visa Assistance', 'Travel Insurance', 'Custom Packages'
    ];
  }

  /** Fetch countries/states/cities for signup forms */
  async getAllCountries(): Promise<Array<{_id: string; name: string}>> {
    try {
      this.getHeaders();
      const resp = await this.apiManager.request(
        { url: apiEndpoints.locations.getAllCountries + '?page=1&limit=1000', method: 'GET' },
        null,
        this.headers
      );
      return resp?.data?.docs || [];
    } catch (e) {
      console.error('Get All Countries Error:', e);
      return [];
    }
  }

  async getAllStates(): Promise<Array<{_id: string; name: string; country_name?: string}>> {
    try {
      this.getHeaders();
      const resp = await this.apiManager.request(
        { url: apiEndpoints.locations.getAllStates + '?page=1&limit=1000', method: 'GET' },
        null,
        this.headers
      );
      return resp?.data?.docs || [];
    } catch (e) {
      console.error('Get All States Error:', e);
      return [];
    }
  }

  async getAllCities(): Promise<Array<{_id: string; name: string; state_name?: string}>> {
    try {
      this.getHeaders();
      const resp = await this.apiManager.request(
        { url: apiEndpoints.locations.getAllCities + '?page=1&limit=1000', method: 'GET' },
        null,
        this.headers
      );
      return resp?.data?.docs || [];
    } catch (e) {
      console.error('Get All Cities Error:', e);
      return [];
    }
  }

  /**
   * Register new user (no id in payload)
   */
  async registerUser(data: any): Promise<UserProfile> {
    try {
      this.getHeaders();

      const payload: any = {};
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'SocialMedia') {
            payload[key] = JSON.stringify(data[key]);
          } else {
            payload[key] = data[key];
          }
        }
      });

      const response = await this.apiManager.request(
        { url: apiEndpoints.profile.updateUserProfile, method: 'POST' },
        payload,
        this.headers
      );
      if (response?.success && response?.data) {
        return response.data;
      }
      throw new Error(response?.message || 'Failed to register user');
    } catch (error: any) {
      console.error('Register User Error:', error);
      await swalHelper.showToast(error.message || 'Failed to register user', 'error');
      throw error;
    }
  }

  /**
   * Fetch all regions for selection
   */
  async getAllRegions(): Promise<Region[]> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.regions.getAllRegions,
          method: 'GET'
        },
        null,
        this.headers
      );

      if (response?.success && response?.data?.docs) {
        return response.data.docs as Region[];
      }

      return [];
    } catch (error) {
      console.error('Get All Regions Error:', error);
      return [];
    }
  }

  /**
   * Format phone number
   */
  formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return 'Not provided';
    
    // Simple formatting for 10-digit numbers
    if (phoneNumber.length === 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    
    return phoneNumber;
  }

  /**
   * Get user initials for avatar fallback
   */
  getUserInitials(profile: UserProfile): string {
    if (!profile.name) return 'U';
    
    const nameParts = profile.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return profile.name[0].toUpperCase();
  }

  /**
   * Check if profile is complete
   */
  isProfileComplete(profile: UserProfile): boolean {
    const requiredFields = [
      profile.name,
      profile.email,
      profile.mobile_number,
      profile.address,
      profile.business_name
    ];
    
    return requiredFields.every(field => field && field.trim() !== '');
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletionPercentage(profile: UserProfile): number {
    const fields = [
      profile.name,
      profile.email,
      profile.mobile_number,
      profile.address,
      profile.business_name,
      profile.profilePic,
      profile.date_of_birth,
      profile.dmc_specializations?.length > 0,
      profile.services_offered?.length > 0,
      profile.regions?.length > 0,
      this.getPrimaryBusiness(profile)?.business_name,
      this.getActiveSocialMediaLinks(profile.SocialMedia).length > 0
    ];
    
    const completedFields = fields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (typeof field === 'number') return field > 0;
      return field && field.toString().trim() !== '';
    }).length;
    
    return Math.round((completedFields / fields.length) * 100);
  }
}