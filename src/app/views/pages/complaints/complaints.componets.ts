import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComplaintService, Complaint, ComplaintResponse } from '../../../services/complaints.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';

@Component({
  selector: 'app-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss']
})
export class ComplaintComponent implements OnInit {
  complaints: Complaint[] = [];
  isLoading = false;
  isSubmitting = false;
  currentPage = 1;
  totalPages = 1;
  totalDocs = 0;
  hasPrevPage = false;
  hasNextPage = false;
  showComplaintModal = false;
  showDetailModal = false;
  complaintForm!: FormGroup;
  selectedComplaint: Complaint | null = null;
  selectedFile: File | null = null;
  selectedFileName = '';
  previewUrl: string | null = null;
  imageUrl: string = environment.imageUrl;

  constructor(
    private complaintService: ComplaintService,
    private fb: FormBuilder,
    private storage: AppStorage
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadComplaints();
  }

  private initializeForm(): void {
    this.complaintForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      details: ['', [Validators.required, Validators.minLength(10)]],
      image: [null]
    });
  }

  async loadComplaints(): Promise<void> {
    this.isLoading = true;
    try {
      const userId = this.getUserId();
      const response: ComplaintResponse = await this.complaintService.getComplaints(userId, this.currentPage);
      
      if (response.success && response.data) {
        this.complaints = response.data.docs || [];
        this.totalDocs = response.data.totalDocs || 0;
        this.totalPages = response.data.totalPages || 1;
        this.currentPage = response.data.page || 1;
        this.hasPrevPage = response.data.hasPrevPage || false;
        this.hasNextPage = response.data.hasNextPage || false;
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
      await swalHelper.showToast('Failed to load complaints', 'error');
      this.complaints = [];
    } finally {
      this.isLoading = false;
    }
  }

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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadComplaints();
    }
  }

  openComplaintModal(): void {
    this.complaintForm.reset();
    this.selectedFile = null;
    this.selectedFileName = '';
    this.previewUrl = null;
    this.showComplaintModal = true;
  }

  closeComplaintModal(): void {
    this.showComplaintModal = false;
    this.complaintForm.reset();
    this.selectedFile = null;
    this.selectedFileName = '';
    this.previewUrl = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        swalHelper.showToast('File size should not exceed 5MB', 'error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        swalHelper.showToast('Please select an image file', 'error');
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.previewUrl = null;
    // Reset the file input
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onSubmitComplaint(): Promise<void> {
    if (this.complaintForm.invalid) {
      Object.keys(this.complaintForm.controls).forEach(key => {
        this.complaintForm.get(key)?.markAsTouched();
      });
      await swalHelper.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    this.isSubmitting = true;
    try {
      const formData = new FormData();
      const userId = this.getUserId();
      
      formData.append('userId', userId);
      formData.append('title', this.complaintForm.value.title);
      formData.append('details', this.complaintForm.value.details);
      formData.append('category', this.complaintForm.value.category);
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      const response = await this.complaintService.createComplaint(formData);
      
      if (response.success) {
        await swalHelper.showToast(response.message || 'Complaint submitted successfully', 'success');
        this.closeComplaintModal();
        // Reload complaints to show the new one
        await this.loadComplaints();
      } else {
        throw new Error(response.message || 'Failed to submit complaint');
      }
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      await swalHelper.showToast(error.message || 'Failed to submit complaint', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  viewComplaintDetails(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedComplaint = null;
  }

  viewImage(imagePath: string): void {
    if (imagePath && imagePath.trim() !== '') {
      window.open(this.imageUrl + imagePath, '_blank');
    }
  }

  getCategoryClass(category: string): string {
    return `category-${category}`;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}
