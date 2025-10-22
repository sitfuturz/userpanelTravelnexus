import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/env/env.local';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService, UserProfile, Region, SocialMedia } from '../../../services/profile.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // User data
  userProfile: UserProfile | null = null;
  
  // Accordion states
  expandedSection: string | null = null;
  
  // Loading states
  isLoading = false;
  isUpdatingProfile = false;
  imageurl = environment.imageUrl;
  
  // Edit states
  isEditMode = false;
  editingSection: string | null = null;
  editableData: any = {};
  
  // Form groups for different sections
  personalForm!: FormGroup;
  businessForm!: FormGroup;
  servicesForm!: FormGroup;
  socialMediaForm!: FormGroup;
  
  // Available options
  availableSpecializations: string[] = [];
  availableServices: string[] = [];
  availableRegions: Region[] = [];

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.loadAvailableOptions();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Initialize form groups
   */
  private initializeForms(): void {
    this.personalForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      city: [''],
      state: [''],
      country: [''],
      address: [''],
      date_of_birth: [null],
      business_name: ['']
    });

    this.businessForm = this.fb.group({
      business_name: [''],
      business_type: ['B2B'],
      category: [''],
      sub_category: [''],
      product: [''],
      service: [''],
      team_size: [0],
      establishment: [null],
      mobile_number: [''],
      email: [''],
      website: [''],
      address: [''],
      about_business_details: ['']
    });

    this.servicesForm = this.fb.group({
      dmc_specializations: [[]],
      services_offered: [[]],
      regions: [[]]
    });

    this.socialMediaForm = this.fb.group({
      Facebook: [''],
      Instagram: [''],
      LinkedIn: [''],
      Twitter: [''],
      YouTube: [''],
      WhatsApp: ['']
    });
  }

  /**
   * Load available options
   */
  private loadAvailableOptions(): void {
    this.availableSpecializations = this.profileService.getAvailableSpecializations();
    this.availableServices = this.profileService.getAvailableServices();
  }

  /**
   * Load regions from API for region dropdown
   */
  private async loadRegions(): Promise<void> {
    this.availableRegions = await this.profileService.getAllRegions();
  }

  /**
   * Load user profile data
   */
  loadUserProfile(): void {
    this.isLoading = true;
    
    try {
      // First try to get from localStorage
      this.userProfile = this.profileService.getUserProfileFromStorage();
      
      if (!this.userProfile) {
        // If not in localStorage, fetch from API
        this.fetchProfileFromAPI();
      } else {
        this.isLoading = false;
        this.populateForms();
        // Ensure regions are loaded even when profile comes from storage
        this.loadRegions();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.isLoading = false;
    }
  }

  /**
   * Fetch profile from API
   */
  private async fetchProfileFromAPI(): Promise<void> {
    try {
      this.userProfile = await this.profileService.getUserProfile();
      this.profileService.saveUserProfileToStorage(this.userProfile);
      this.populateForms();
      await this.loadRegions();
    } catch (error) {
      console.error('Error fetching profile from API:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Populate forms with current data
   */
  private populateForms(): void {
    if (!this.userProfile) return;

    // Personal form
    this.personalForm.patchValue({
      name: this.userProfile.name,
      email: this.userProfile.email,
      mobile_number: this.userProfile.mobile_number,
      city: this.userProfile.city,
      state: this.userProfile.state,
      country: this.userProfile.country,
      address: this.userProfile.address,
      date_of_birth: this.userProfile.date_of_birth,
      business_name: this.userProfile.business_name
    });

    // Business form
    const primaryBusiness = this.getPrimaryBusiness();
    if (primaryBusiness) {
      this.businessForm.patchValue({
        business_name: primaryBusiness.business_name,
        business_type: primaryBusiness.business_type,
        category: primaryBusiness.category,
        sub_category: primaryBusiness.sub_category,
        product: primaryBusiness.product,
        service: primaryBusiness.service,
        team_size: primaryBusiness.team_size,
        establishment: primaryBusiness.establishment,
        mobile_number: primaryBusiness.mobile_number,
        email: primaryBusiness.email,
        website: primaryBusiness.website,
        address: primaryBusiness.address,
        about_business_details: primaryBusiness.about_business_details
      });
    }

    // Services form
    this.servicesForm.patchValue({
      dmc_specializations: this.userProfile.dmc_specializations || [],
      services_offered: this.userProfile.services_offered || [],
      regions: (this.userProfile.regions || []).map(r => r._id)
    });

    // Social media form
    this.socialMediaForm.patchValue({
      Facebook: this.userProfile.SocialMedia?.Facebook || '',
      Instagram: this.userProfile.SocialMedia?.Instagram || '',
      LinkedIn: this.userProfile.SocialMedia?.LinkedIn || '',
      Twitter: this.userProfile.SocialMedia?.Twitter || '',
      YouTube: this.userProfile.SocialMedia?.YouTube || '',
      WhatsApp: this.userProfile.SocialMedia?.WhatsApp || ''
    });
  }

  /**
   * Toggle accordion section
   */
  toggleSection(section: string): void {
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  /**
   * Check if section is expanded
   */
  isSectionExpanded(section: string): boolean {
    return this.expandedSection === section;
  }

  /**
   * Get user's profile picture URL
   */
  getProfilePictureUrl(): string {
    if (this.userProfile?.profilePic && this.userProfile.profilePic.trim() !== '') {
      return this.userProfile.profilePic;
    }
    return this.profileService.getDefaultAvatar();
  }

  /**
   * Get user's primary business
   */
  getPrimaryBusiness(): any {
    if (!this.userProfile) return null;
    return this.profileService.getPrimaryBusiness(this.userProfile);
  }

  /**
   * Get user's full address
   */
  getFullAddress(): string {
    if (!this.userProfile) return '';
    return this.profileService.formatFullAddress(this.userProfile);
  }

  /**
   * Get active social media links
   */
  getActiveSocialMediaLinks(): Array<{platform: string, url: string}> {
    if (!this.userProfile?.SocialMedia) return [];
    return this.profileService.getActiveSocialMediaLinks(this.userProfile.SocialMedia);
  }

  /**
   * Handle profile picture error
   */
  onProfilePictureError(event: any): void {
    event.target.src = this.profileService.getDefaultAvatar();
  }

  /**
   * Format date for display
   */
  formatDate(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return 'Not provided';
    
    try {
      let date: Date;
      
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return 'Not provided';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  /**
   * Get social media icon class
   */
  getSocialMediaIcon(platform: string): string {
    const iconMap: {[key: string]: string} = {
      'Facebook': 'fab fa-facebook-f',
      'Instagram': 'fab fa-instagram',
      'LinkedIn': 'fab fa-linkedin-in',
      'Twitter': 'fab fa-twitter',
      'YouTube': 'fab fa-youtube',
      'WhatsApp': 'fab fa-whatsapp'
    };
    
    return iconMap[platform] || 'fas fa-link';
  }

  /**
   * Open social media link
   */
  openSocialMediaLink(url: string): void {
    if (url && url.trim() !== '') {
      // Ensure URL has protocol
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Handle edit section action
   */
  onEditSection(section: string): void {
    this.isEditMode = true;
    this.editingSection = section;
    this.populateForms();
  }

  /**
   * Handle cancel edit action
   */
  onCancelEdit(): void {
    this.isEditMode = false;
    this.editingSection = null;
    this.populateForms();
  }

  /**
   * Handle save section action
   */
  async onSaveSection(): Promise<void> {
    if (!this.userProfile) return;

    let formData: any = {};
    let isValid = true;

    // Validate and get form data based on current section
    switch (this.editingSection) {
      case 'personal':
        if (this.personalForm.valid) {
          formData = this.personalForm.value;
        } else {
          isValid = false;
          this.markFormGroupTouched(this.personalForm);
        }
        break;
      
      case 'business':
        if (this.businessForm.valid) {
          formData = {
            business: [this.businessForm.value]
          };
        } else {
          isValid = false;
          this.markFormGroupTouched(this.businessForm);
        }
        break;
      
      case 'services':
        if (this.servicesForm.valid) {
          // Ensure we send only IDs for regions
          const { dmc_specializations, services_offered, regions } = this.servicesForm.value;
          formData = {
            dmc_specializations,
            services_offered,
            regions
          };
        } else {
          isValid = false;
          this.markFormGroupTouched(this.servicesForm);
        }
        break;
      
      case 'social':
        if (this.socialMediaForm.valid) {
          formData = {
            SocialMedia: this.socialMediaForm.value
          };
        } else {
          isValid = false;
          this.markFormGroupTouched(this.socialMediaForm);
        }
        break;
    }

    if (!isValid) {
      await swalHelper.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    this.isUpdatingProfile = true;
    
    try {
      const updatedProfile = await this.profileService.updateUserProfile(formData);
      this.userProfile = updatedProfile;
      this.profileService.saveUserProfileToStorage(updatedProfile);
      this.isEditMode = false;
      this.editingSection = null;
      
      await swalHelper.showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      await swalHelper.showToast('Failed to update profile', 'error');
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  /**
   * Toggle region selection (IDs only)
   */
  onRegionToggle(regionId: string, isChecked: boolean): void {
    const current: string[] = [...(this.servicesForm.value.regions || [])];
    const existsIndex = current.indexOf(regionId);
    if (isChecked && existsIndex === -1) {
      current.push(regionId);
    } else if (!isChecked && existsIndex > -1) {
      current.splice(existsIndex, 1);
    }
    this.servicesForm.patchValue({ regions: current });
  }

  /**
   * Mark form group as touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Handle profile picture change
   */
  async onProfilePictureChange(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      await swalHelper.showToast('Please select a valid image file (JPEG, PNG, GIF)', 'error');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      await swalHelper.showToast('File size must be less than 5MB', 'error');
      return;
    }

    this.isLoading = true;
    
    try {
      const profilePicUrl = await this.profileService.uploadProfilePicture(file);
      
      if (this.userProfile && profilePicUrl) {
        this.userProfile.profilePic = profilePicUrl;
        this.profileService.saveUserProfileToStorage(this.userProfile);
      }
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    } finally {
      this.isLoading = false;
      // Clear the file input
      event.target.value = '';
    }
  }

  /**
   * Get section header icon
   */
  getSectionIcon(section: string): string {
    const iconMap: {[key: string]: string} = {
      'personal': 'fas fa-user',
      'business': 'fas fa-briefcase',
      'services': 'fas fa-cogs',
      'social': 'fas fa-share-alt'
    };
    
    return iconMap[section] || 'fas fa-circle';
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phoneNumber: string): string {
    return this.profileService.formatPhoneNumber(phoneNumber);
  }

  /**
   * Get user initials for avatar fallback
   */
  getUserInitials(): string {
    if (!this.userProfile) return 'U';
    return this.profileService.getUserInitials(this.userProfile);
  }

  /**
   * Check if user has complete profile
   */
  isProfileComplete(): boolean {
    if (!this.userProfile) return false;
    return this.profileService.isProfileComplete(this.userProfile);
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletionPercentage(): number {
    if (!this.userProfile) return 0;
    return this.profileService.getProfileCompletionPercentage(this.userProfile);
  }

  /**
   * Get region display name
   */
  getRegionDisplayName(region: Region): string {
    return `${region.name} (${region.code})`;
  }

  /**
   * Get specialization display
   */
  getSpecializationsDisplay(): string {
    if (!this.userProfile?.dmc_specializations || this.userProfile.dmc_specializations.length === 0) {
      return 'Not specified';
    }
    return this.userProfile.dmc_specializations.join(', ');
  }

  /**
   * Get services display
   */
  getServicesDisplay(): string {
    if (!this.userProfile?.services_offered || this.userProfile.services_offered.length === 0) {
      return 'Not specified';
    }
    return this.userProfile.services_offered.join(', ');
  }

  /**
   * Get regions display
   */
  getRegionsDisplay(): string {
    if (!this.userProfile?.regions || this.userProfile.regions.length === 0) {
      return 'Not specified';
    }
    return this.userProfile.regions.map(r => r.name).join(', ');
  }

  /**
   * Toggle specialization selection
   */
  toggleSpecialization(specialization: string): void {
    if (!this.userProfile) return;
    
    if (!this.userProfile.dmc_specializations) {
      this.userProfile.dmc_specializations = [];
    }
    
    const index = this.userProfile.dmc_specializations.indexOf(specialization);
    if (index > -1) {
      this.userProfile.dmc_specializations.splice(index, 1);
    } else {
      this.userProfile.dmc_specializations.push(specialization);
    }
    
    // Update form
    this.servicesForm.patchValue({
      dmc_specializations: this.userProfile.dmc_specializations
    });
  }

  /**
   * Toggle service selection
   */
  toggleService(service: string): void {
    if (!this.userProfile) return;
    
    if (!this.userProfile.services_offered) {
      this.userProfile.services_offered = [];
    }
    
    const index = this.userProfile.services_offered.indexOf(service);
    if (index > -1) {
      this.userProfile.services_offered.splice(index, 1);
    } else {
      this.userProfile.services_offered.push(service);
    }
    
    // Update form
    this.servicesForm.patchValue({
      services_offered: this.userProfile.services_offered
    });
  }
}