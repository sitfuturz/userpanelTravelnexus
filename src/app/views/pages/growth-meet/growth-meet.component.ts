import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  GrowthMeetService, 
  GrowthMeet, 
  GrowthMeetResponse, 
  User, 
  UserResponse, 
  CreateGrowthMeetRequest 
} from '../../../services/growth-meet.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-growth-meet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './growth-meet.component.html',
  styleUrls: ['./growth-meet.component.scss']
})
export class GrowthMeetComponent implements OnInit {

  environment = environment;

  // Tab state
  activeTab: 'initiated' | 'others' = 'initiated';
  
  // Data arrays
  initiatedGrowthMeets: GrowthMeet[] = [];
  othersGrowthMeets: GrowthMeet[] = [];
  availableUsers: User[] = [];
  filteredUsers: User[] = [];
  
  // Loading states
  isLoading = false;
  isSubmitting = false;
  
  // Searchable dropdown properties
  showMemberDropdown = false;
  memberSearchTerm = '';
  selectedMemberDisplay = '';
  isLoadingUsers = false;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  
  imageUrl: string = environment.imageUrl;
  // Modal states
  showGrowthMeetModal = false;
  showDetailModal = false;
  selectedGrowthMeet: GrowthMeet | null = null;
  selectedMember: User | null = null;
  
  // Form and photo handling
  growthMeetForm!: FormGroup;
  selectedPhoto: File | null = null;
  photoPreviewUrl: string | null = null;
  
  // Current user ID
  currentUserId: string = '';

  constructor(
    private growthMeetService: GrowthMeetService,
    private fb: FormBuilder,
    private storage: AppStorage
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.getCurrentUserId();
    this.loadActiveTabData();
    this.loadAvailableUsers();
  }

  private getCurrentUserId(): void {
    try {
        const token = this.storage.get(common.TOKEN);
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Current user ID:', payload.userId);
        this.currentUserId = payload.userId;
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
  }

  private initializeForm(): void {
    this.growthMeetForm = this.fb.group({
      memberId: ['', Validators.required],
      initiatedBy: ['myself', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      topics: ['', Validators.required]
    });
  }

  // Tab switching
  switchTab(tab: 'initiated' | 'others'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadActiveTabData();
  }

  // Load data based on active tab
  async loadActiveTabData(): Promise<void> {
    this.isLoading = true;
    try {
      if (this.activeTab === 'initiated') {
        await this.loadInitiatedGrowthMeets();
      } else {
        await this.loadOthersGrowthMeets();
      }
    } catch (error) {
      console.error('Error loading growth meets:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Load initiated growth meets
  async loadInitiatedGrowthMeets(): Promise<void> {
    try {
      const response: GrowthMeetResponse = await this.growthMeetService.getInitiatedOneToOne(
        this.currentPage, 
        this.itemsPerPage
      );
      
      this.initiatedGrowthMeets = Array.isArray(response) ? response : [];
      this.totalPages = response.totalPages || 1;
      
      console.log('Initiated growth meets loaded:', this.initiatedGrowthMeets);
    } catch (error) {
      console.error('Error loading initiated growth meets:', error);
      this.initiatedGrowthMeets = [];
    }
  }

  // Load growth meets by others
  async loadOthersGrowthMeets(): Promise<void> {
    try {
      const response: GrowthMeetResponse = await this.growthMeetService.getInitiatedByOthers(
        this.currentPage, 
        this.itemsPerPage
      );
      
      this.othersGrowthMeets = Array.isArray(response) ? response : [];
      this.totalPages = response.totalPages || 1;
      
      console.log('Others growth meets loaded:', this.othersGrowthMeets);
    } catch (error) {
      console.error('Error loading others growth meets:', error);
      this.othersGrowthMeets = [];
    }
  }

  // Load available users
  async loadAvailableUsers(): Promise<void> {
    this.isLoadingUsers = true;
    try {
      const response: UserResponse = await this.growthMeetService.getAllUsers(1, 100);
      this.availableUsers = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response.docs) ? response.docs : [];
      
      // Filter out current user
      this.availableUsers = this.availableUsers.filter(user => user._id !== this.currentUserId);
      
      // Initialize filtered users for searchable dropdown
      this.filteredUsers = this.availableUsers;
      
      console.log('Available users loaded:', this.availableUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      this.availableUsers = [];
      this.filteredUsers = [];
    } finally {
      this.isLoadingUsers = false;
    }
  }

  // Get current growth meets based on active tab
  get currentGrowthMeets(): GrowthMeet[] {
    return this.activeTab === 'initiated' ? this.initiatedGrowthMeets : this.othersGrowthMeets;
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadActiveTabData();
    }
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal methods
  openGrowthMeetModal(): void {
    this.showGrowthMeetModal = true;
    this.resetForm();
    // Reset dropdown state
    this.selectedMemberDisplay = '';
    this.showMemberDropdown = false;
    this.memberSearchTerm = '';
    this.filteredUsers = this.availableUsers;
  }

  closeGrowthMeetModal(): void {
    this.showGrowthMeetModal = false;
    this.resetForm();
    // Reset dropdown state
    this.selectedMemberDisplay = '';
    this.showMemberDropdown = false;
    this.memberSearchTerm = '';
    this.filteredUsers = this.availableUsers;
  }

  openDetailModal(growthMeet: GrowthMeet): void {
    this.selectedGrowthMeet = growthMeet;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedGrowthMeet = null;
  }

  private resetForm(): void {
    this.growthMeetForm.reset();
    this.growthMeetForm.patchValue({
      initiatedBy: 'myself'
    });
    this.selectedMember = null;
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
    // Reset dropdown state
    this.selectedMemberDisplay = '';
    this.showMemberDropdown = false;
    this.memberSearchTerm = '';
    this.filteredUsers = this.availableUsers;
  }

  // Searchable dropdown methods
  onMemberSearch(event: any): void {
    this.memberSearchTerm = event.target.value.toLowerCase();
    this.showMemberDropdown = true;
    
    if (this.memberSearchTerm) {
      this.filteredUsers = this.availableUsers.filter(user => 
        user.name.toLowerCase().includes(this.memberSearchTerm) ||
        (user.chapter_name && user.chapter_name.toLowerCase().includes(this.memberSearchTerm))
      );
    } else {
      this.filteredUsers = this.availableUsers;
    }
  }

  onMemberFocus(): void {
    // Show all members when user clicks/focuses on the input
    this.filteredUsers = this.availableUsers;
    this.showMemberDropdown = true;
  }

  onMemberBlur(): void {
    // Hide dropdown after a short delay to allow click events on items
    setTimeout(() => {
      this.showMemberDropdown = false;
    }, 200);
  }

  selectMember(user: User): void {
    this.showMemberDropdown = false;
    this.selectedMemberDisplay = `${user.name} - ${user.chapter_name || 'N/A'}`;
    this.selectedMember = user;
    this.growthMeetForm.patchValue({
      memberId: user._id
    });
    this.memberSearchTerm = '';
  }

  // Member selection
  onMemberSelected(event: any): void {
    const memberId = event.target.value;
    const member = this.availableUsers.find(user => user._id === memberId);
    if (member) {
      this.selectedMember = member;
    }
  }

  removeMember(): void {
    this.selectedMember = null;
    this.growthMeetForm.patchValue({ memberId: '' });
  }

  // Photo handling
  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Form submission
  async onSubmitGrowthMeet(): Promise<void> {
    if (this.growthMeetForm.invalid || !this.selectedMember) {
      await swalHelper.showToast('Please fill all required fields and select a member', 'error');
      return;
    }

    this.isSubmitting = true;
    try {
      const formValue = this.growthMeetForm.value;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('memberId1', this.currentUserId);
      formData.append('memberId2', this.selectedMember._id);
      formData.append('initiatedBy', formValue.initiatedBy === 'myself' ? this.currentUserId : this.selectedMember._id);
      formData.append('meet_place', formValue.location);
      formData.append('date', formValue.date);
      formData.append('topics', formValue.topics);
      
      if (this.selectedPhoto) {
        formData.append('oneToOnePhoto', this.selectedPhoto);
      }

      console.log('Creating growth meet with form data');
      
      // Use the updated service method
      await this.growthMeetService.createGrowthMeet(formData);
      
      this.closeGrowthMeetModal();
      await this.loadActiveTabData();
      
      await swalHelper.showToast('Growth meet created successfully!', 'success');
      
    } catch (error) {
      console.error('Error creating growth meet:', error);
      await swalHelper.showToast('Failed to create growth meet', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  // Utility methods
  getMemberName(growthMeet: GrowthMeet): string {
    console.log('Active tab:', growthMeet);
    if (this.activeTab === 'initiated') {
      // Show the other member (member2 if current user is member1)
      return growthMeet.memberId2?.name || growthMeet.memberId1?.name || 'Unknown Member';
    } else {
      // Show member1 when viewing others' initiated meets
      return growthMeet.memberId1?.name || 'Unknown Member';
    }
  }

  getMemberAvatar(growthMeet: GrowthMeet): string {
    if (this.activeTab === 'initiated') {
      return growthMeet.memberId2?.profilePic || growthMeet.memberId1?.profilePic || 'assets/images/placeholder-image.png';
    } else {
      return growthMeet.memberId1?.profilePic || 'assets/images/placeholder-image.png';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Form validation helpers
  get isFormValid(): boolean {
    return this.growthMeetForm.valid && !!this.selectedMember;
  }

  getFormControl(controlName: string) {
    return this.growthMeetForm.get(controlName);
  }

  hasFormError(controlName: string, errorType: string): boolean {
    const control = this.getFormControl(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  // Track by functions for ngFor performance
  trackByGrowthMeetId(index: number, growthMeet: GrowthMeet): string {
    return growthMeet._id;
  }

  trackByUserId(index: number, user: User): string {
    return user._id;
  }
}