// member-directory.service.ts
import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';

export interface City {
  _id: string;
  name: string;
  state_name: string;
  status: boolean;
  createdAt: string;
  __v: number;
}

export interface Chapter {
  _id: string;
  name: string;
  city_name: string;
  status: boolean;
  createdAt: string;
  __v: number;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  profilePic: string;
  city: string;
  state: string;
  country: string;
  business_name: string;
  isMember: boolean;
  isprivacy: boolean;
  regions: Array<{
    _id: string;
    name: string;
    description: string;
    countries: string[];
  }>;
  dmc_specializations: string[];
  services_offered: string[];
  business: Array<{
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
  }>;
  createdAt: string;
  updatedAt: string;
}


export interface CitiesResponse {
  message: string;
  data: {
    docs: City[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
  status: number;
  success: boolean;
}

export interface ChaptersResponse {
  message: string;
  data: {
    docs: Chapter[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
  status: number;
  success: boolean;
}

export interface MembersResponse {
  success: boolean;
  message: string;
  data: {
    docs: Member[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
  status: number;
}


export interface MemberDetailsResponse {
  success: boolean;
  data: {
    bioDetails: {
      yearsInBusiness: string;
      previousTypesOfBusiness: string;
      spouse: string;
      children: string;
      pets: string;
      hobbies: string;
      cityOfResidence: string;
      yearInThatCity: string;
      myBurningDesire: string;
      somethingNoOne: string;
      myKeyToSuccess: string;
    };
    growthSheet: {
      goals: string;
      accomplishment: string;
      interests: string;
      networks: string;
      skills: string;
    };
    topProfile: {
      idealReferral: string;
      topProduct: string;
      topProblemSolved: string;
      favouriteLgnStory: string;
      idealReferralParter: string;
    };
    weeklyPresentation: {
      presentation1: string;
      presentation2: string;
    };
    fees: {
      total_fee: number;
      paid_fee: number;
      pending_fee: number;
      renewal_fee: number;
      end_date: string | null;
      is_renewed: boolean;
      induction_date: string;
      fee_history: any[];
    };
    SocialMedia: {
      Facebook: string;
      Instagram: string;
      LinkedIn: string;
      Twitter: string;
      YouTube: string;
      WhatsApp: string;
    };
    _id: string;
    name: string;
    digitalCardLink: string;
    chapter_name: string;
    city: string;
    state: string;
    country: string;
    mobile_number: string;
    email: string;
    date_of_birth: string | null;
    marriage_anniversary: string | null;
    profilePic: string;
    emergency_contact: string;
    address: string;
    introduction_details: string;
    meeting_role: string;
    keywords: string;
    business: Array<{
      logo: string | null;
      banner_image: string;
      business_name: string;
      business_type: string;
      primary_business: boolean;
      category: string;
      sub_category: string;
      product: string;
      service: string;
      formation: string;
      establishment: string | null;
      team_size: number;
      mobile_number: string;
      email: string;
      website: string;
      address: string;
      about_business_details: string;
      _id: string;
    }>;
    badges: Array<{
      badgeId: string;
      assignedAt: string;
      _id: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MemberDirectoryService {
  private headers: any = [];
  private baseUrl = ''; // Set your API base URL here

  constructor(
    private apiManager: ApiManager,
    private storage: AppStorage
  ) {}

  private getHeaders = () => {
    this.headers = [];
    const token = this.storage.get(common.TOKEN);
    if (token) {
      this.headers.push({ 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
  };

  /**
   * Get list of cities with pagination
   */
  async getCities(page: number = 1, limit: number = 10): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `https://gbs-connect.com/admin/getCities?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Error fetching cities:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch cities', 'error');
      throw error;
    }
  }

  /**
   * Validate member data
   */
  validateMemberData(member: Partial<Member>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!member.name || member.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!member.email || !this.isValidEmail(member.email)) {
      errors.push('Valid email is required');
    }
    
    if (!member.mobile_number || !this.isValidMobileNumber(member.mobile_number)) {
      errors.push('Valid mobile number is required');
    }
    
    if (!member.city || member.city.trim() === '') {
      errors.push('City is required');
    }
    
    if (!member.business_name || member.business_name.trim() === '') {
      errors.push('Business name is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate mobile number format (Indian format)
   */
  private isValidMobileNumber(mobile: string): boolean {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile.replace(/\D/g, ''));
  }

  /**
   * Format mobile number for display
   */
  formatMobileNumber(mobile: string): string {
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.substr(0, 5)} ${cleaned.substr(5)}`;
    }
    return mobile;
  }

  /**
   * Get WhatsApp link for member
   */
  getWhatsAppLink(member: Member, message?: string): string {
    if (!member.mobile_number) {
      return '';
    }
    
    let phoneNumber = member.mobile_number.replace(/\D/g, '');
    // Add country code for India if not present
    if (phoneNumber.length === 10) {
      phoneNumber = '91' + phoneNumber;
    }
    
    const defaultMessage = `Hi ${member.name}, I found your contact through the Member Directory.`;
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  /**
   * Cache management methods
   */
  private cacheKey = {
    cities: 'member_directory_cities',
    chapters: 'member_directory_chapters',
    members: 'member_directory_members'
  };

  /**
   * Get cached data
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.storage.get(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still valid (1 hour)
      if (Date.now() - parsed.timestamp < 3600000) {
        return parsed.data;
      }
    }
    return null;
  }

  /**
   * Set cached data
   */
  private setCachedData<T>(key: string, data: T): void {
    this.storage.set(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }

  /**
   * Clear all cached data
   */
//   clearCache(): void {
//     Object.values(this.cacheKey).forEach(key => {
//       this.storage.remove(key);
//     });
//   }


 
  async getChapters(page: number = 1, limit: number = 10): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `https://gbs-connect.com/admin/getChapters?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Error fetching chapters:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch chapters', 'error');
      throw error;
    }
  }

  /**
   * Get filtered list of members
   */
  async getMembers(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<MembersResponse> {
    try {
      this.getHeaders();
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const url = `https://travelnexus.itfuturz.in/admin/get-all-members${queryString ? '?' + queryString : ''}`;
      
      const response = await this.apiManager.request(
        {
          url,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response as MembersResponse;
    } catch (error: any) {
      console.error('Error fetching members:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch members', 'error');
      throw error;
    }
  }

  /**
   * Get detailed user information by user ID
   */
  async getUserDetails(userId: string): Promise<any> {
  try {
    this.getHeaders();
    
    const response = await this.apiManager.request(
      {
        url: `http://localhost:3200/mobile/get-users/${userId}`,
        method: 'GET',
      },
      null,
      this.headers
    );
    
    return response;
  } catch (error: any) {
    console.error(`Error fetching user details for ${userId}:`, error);
    await swalHelper.showToast(error.message || 'Failed to fetch user details', 'error');
    throw error;
  }
}

  /**
   * Search members by keyword
   */
  async searchMembers(keyword: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `mobile/search-users?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Error searching members:', error);
      await swalHelper.showToast(error.message || 'Failed to search members', 'error');
      throw error;
    }
  }

  /**
   * Get all cities without pagination (for dropdown)
   */
  async getAllCities(): Promise<City[]> {
    try {
      const response = await this.getCities(1, 100);
      return response.data.docs || [];
    } catch (error) {
      console.error('Error fetching all cities:', error);
      return [];
    }
  }

  /**
   * Get all chapters without pagination (for dropdown)
   */
  async getAllChapters(): Promise<Chapter[]> {
    try {
      const response = await this.getChapters(1, 100);
      return response.data.docs || [];
    } catch (error) {
      console.error('Error fetching all chapters:', error);
      return [];
    }
  }

  /**
   * Get chapters by city
   */
  async getChaptersByCity(cityName: string): Promise<Chapter[]> {
    try {
      const allChapters = await this.getAllChapters();
      return allChapters.filter(chapter => chapter.city_name === cityName);
    } catch (error) {
      console.error('Error fetching chapters by city:', error);
      return [];
    }
  }

  /**
   * Export members to CSV
   */
  async exportMembersToCSV(params: {
    city?: string;
    chapter_name?: string;
  } = {}): Promise<Blob> {
    try {
      // Get all members with filters
      const members = await this.getAllMembersForExport(params);
      
      // Convert to CSV
      const csv = this.convertToCSV(members);
      
      // Create and return blob
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    } catch (error: any) {
      console.error('Error exporting members:', error);
      await swalHelper.showToast(error.message || 'Failed to export members', 'error');
      throw error;
    }
  }

  /**
   * Get all members for export (without pagination)
   */
  private async getAllMembersForExport(params: {
    city?: string;
    chapter_name?: string;
  } = {}): Promise<Member[]> {
    try {
      const response = await this.getMembers({
        ...params,
        page: 1,
        limit: 1000 // Get all members
      });
      return response.data.docs || [];
    } catch (error) {
      console.error('Error fetching members for export:', error);
      return [];
    }
  }

  /**
   * Convert members array to CSV string
   */
  private convertToCSV(members: Member[]): string {
    if (members.length === 0) {
      return '';
    }

    // Define CSV headers
    const headers = [
      'Name',
      'Email',
      'Mobile Number',
      'City',
      'State',
      'Country',
      'Business Name',
      'Business Type',
      'Regions',
      'DMC Specializations',
      'Services Offered'
    ];

    // Create CSV rows
    const rows = members.map(member => [
      this.escapeCSV(member.name || ''),
      this.escapeCSV(member.email || ''),
      this.escapeCSV(member.mobile_number || ''),
      this.escapeCSV(member.city || ''),
      this.escapeCSV(member.state || ''),
      this.escapeCSV(member.country || ''),
      this.escapeCSV(member.business_name || ''),
      this.escapeCSV(member.business?.[0]?.business_type || ''),
      this.escapeCSV(member.regions?.map(r => r.name).join('; ') || ''),
      this.escapeCSV(member.dmc_specializations?.join('; ') || ''),
      this.escapeCSV(member.services_offered?.join('; ') || '')
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Escape CSV field values
   */
  private escapeCSV(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Get member statistics
   */
  async getMemberStats(): Promise<{
    totalMembers: number;
    totalCities: number;
    totalChapters: number;
    membersByCity: { [key: string]: number };
    membersByRegion: { [key: string]: number };
  }> {
    try {
      this.getHeaders();
      
      // Get all data
      const [membersResponse, citiesResponse, chaptersResponse] = await Promise.all([
        this.getMembers({ page: 1, limit: 1000 }),
        this.getCities(1, 100),
        this.getChapters(1, 100)
      ]);

      const members = membersResponse.data.docs || [];
      
      // Calculate statistics
      const membersByCity: { [key: string]: number } = {};
      const membersByRegion: { [key: string]: number } = {};
      
      members.forEach(member => {
        if (member.city) {
          membersByCity[member.city] = (membersByCity[member.city] || 0) + 1;
        }
        if (member.regions && member.regions.length > 0) {
          member.regions.forEach(region => {
            membersByRegion[region.name] = (membersByRegion[region.name] || 0) + 1;
          });
        }
      });

      return {
        totalMembers: membersResponse.data.totalDocs || 0,
        totalCities: citiesResponse.data.totalDocs || 0,
        totalChapters: chaptersResponse.data.totalDocs || 0,
        membersByCity,
        membersByRegion
      };
    } catch (error: any) {
      console.error('Error fetching member statistics:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch statistics', 'error');
      throw error;
    }
  }}