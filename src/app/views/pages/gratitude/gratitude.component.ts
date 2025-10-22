import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  GratitudeService, 
  Testimonial, 
  TestimonialResponse, 
  User, 
  UserResponse, 
  CreateTestimonialRequest 
} from '../../../services/gratitude.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-gratitude',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gratitude.component.html',
  styleUrls: ['./gratitude.component.scss']
})
export class GratitudeComponent implements OnInit {
  // Tab state
  activeTab: 'received' | 'pending' = 'received';
  
  // Data arrays
  receivedTestimonials: Testimonial[] = [];
  pendingTestimonials: Testimonial[] = [];
  availableUsers: User[] = [];
  filteredUsers: User[] = [];
  
  // Loading states
  isLoading = false;
  isLoadingUsers = false;
  
  // Searchable dropdown properties
  showMemberDropdown = false;
  memberSearchTerm = '';
  selectedMemberDisplay = '';
  imageUrl: string = environment.imageUrl;
  // Pagination
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  
  // Modal state
  showGratitudeModal = false;
  gratitudeForm!: FormGroup;
  
  // Current user ID (from token)
  currentUserId: string = '';

  constructor(
    private gratitudeService: GratitudeService,
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
    this.gratitudeForm = this.fb.group({
      gratitudeType: ['give', Validators.required],
      receiverId: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  // Tab switching
  switchTab(tab: 'received' | 'pending'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadActiveTabData();
  }

  // Load data based on active tab
  async loadActiveTabData(): Promise<void> {
    this.isLoading = true;
    try {
      if (this.activeTab === 'received') {
        await this.loadReceivedTestimonials();
      } else {
        await this.loadPendingTestimonials();
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Load received testimonials
  async loadReceivedTestimonials(): Promise<void> {
    try {
      const response: TestimonialResponse = await this.gratitudeService.getTestimonialsByReceiverId(
        this.currentUserId, 
        this.currentPage, 
        this.itemsPerPage
      );
      
      this.receivedTestimonials = Array.isArray(response.data) ? response.data : [];
      this.totalPages = response.totalPages || 1;
      
      console.log('Received testimonials loaded:', this.receivedTestimonials);
    } catch (error) {
      console.error('Error loading received testimonials:', error);
      this.receivedTestimonials = [];
    }
  }

  // Load pending testimonials (testimonial requests)
  async loadPendingTestimonials(): Promise<void> {
    try {
      const response: TestimonialResponse = await this.gratitudeService.getTestimonialRequestsByReceiverId(
        this.currentUserId, 
        this.currentPage, 
        this.itemsPerPage
      );
      
      this.pendingTestimonials = Array.isArray(response.data) ? response.data : [];
      this.totalPages = response.totalPages || 1;
      
      console.log('Pending testimonials loaded:', this.pendingTestimonials);
    } catch (error) {
      console.error('Error loading pending testimonials:', error);
      this.pendingTestimonials = [];
    }
  }

  // Load available users for dropdown
  async loadAvailableUsers(): Promise<void> {
    this.isLoadingUsers = true;
    try {
      const response: UserResponse = await this.gratitudeService.getAllUsersData(1, 100);
      this.availableUsers = Array.isArray(response.docs) ? response.docs : [];
      
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

  // Get current testimonials based on active tab
  get currentTestimonials(): Testimonial[] {
    return this.activeTab === 'received' ? this.receivedTestimonials : this.pendingTestimonials;
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
  openGratitudeModal(): void {
    this.showGratitudeModal = true;
    this.gratitudeForm.reset();
    this.gratitudeForm.patchValue({
      gratitudeType: 'give'
    });
    // Reset dropdown state
    this.selectedMemberDisplay = '';
    this.showMemberDropdown = false;
    this.memberSearchTerm = '';
    this.filteredUsers = this.availableUsers;
  }

  closeGratitudeModal(): void {
    this.showGratitudeModal = false;
    this.gratitudeForm.reset();
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
    this.gratitudeForm.patchValue({
      receiverId: user._id
    });
    this.memberSearchTerm = '';
  }

  // Submit gratitude form
  async onSubmitGratitude(): Promise<void> {
    if (this.gratitudeForm.invalid) {
      await swalHelper.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    try {
      const formValue = this.gratitudeForm.value;
      
      const testimonialData: CreateTestimonialRequest = {
        giverId: this.currentUserId,
        receiverId: formValue.receiverId,
        message: formValue.message,
        date: new Date().toISOString()
      };

      console.log('Creating testimonial with data:', testimonialData);
      
      await this.gratitudeService.createTestimonial(testimonialData);
      this.closeGratitudeModal();
      
      // Refresh the current tab data
      await this.loadActiveTabData();
      
      await swalHelper.showToast('Testimonial created successfully!', 'success');
      
    } catch (error) {
      console.error('Error creating testimonial:', error);
      await swalHelper.showToast('Failed to create testimonial', 'error');
    }
  }

  // Approve testimonial and redirect to add gratitude form
  approveAndRedirect(testimonial: Testimonial): void {
    // Directly open the add gratitude form with pre-selected user
    this.openGratitudeModalWithPreSelectedUser(testimonial.giverId);
  }

  // Open gratitude modal with pre-selected user
  openGratitudeModalWithPreSelectedUser(giver: any): void {
    this.showGratitudeModal = true;
    this.gratitudeForm.reset();
    this.gratitudeForm.patchValue({
      gratitudeType: 'give',
      receiverId: giver._id
    });
    
    // Set the selected member display for the searchable dropdown
    this.selectedMemberDisplay = `${giver.name} - ${giver.chapter_name || 'N/A'}`;
    
    // Reset dropdown state
    this.showMemberDropdown = false;
    this.memberSearchTerm = '';
    this.filteredUsers = this.availableUsers;
  }



  // Toggle testimonial expansion (for received tab)
  toggleTestimonialExpansion(testimonial: Testimonial): void {
    if (this.activeTab === 'received') {
      testimonial.selected = !testimonial.selected;
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getUserName(user: any): string {
    return user?.name || 'Unknown User';
  }

  getUserProfilePic(user: any): string {
    return user?.profilePic || 'assets/images/placeholder-image.png';
  }

  // Handle form validation
  get isFormValid(): boolean {
    return this.gratitudeForm.valid;
  }

  // Get form control for validation
  getFormControl(controlName: string) {
    return this.gratitudeForm.get(controlName);
  }

  // Check if form control has error
  hasFormError(controlName: string, errorType: string): boolean {
    const control = this.getFormControl(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  // Get error message for form control
  getErrorMessage(controlName: string): string {
    const control = this.getFormControl(controlName);
    
    if (this.hasFormError(controlName, 'required')) {
      return `${controlName} is required`;
    }
    
    if (this.hasFormError(controlName, 'minlength')) {
      const minLength = control?.errors?.['minlength']?.requiredLength;
      return `${controlName} must be at least ${minLength} characters`;
    }
    
    return '';
  }

  // Track by function for ngFor performance
  trackByTestimonialId(index: number, testimonial: Testimonial): string {
    return testimonial._id;
  }

  trackByUserId(index: number, user: User): string {
    return user._id;
  }
}