import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuggestionService, Suggestion, SuggestionResponse } from '../../../services/suggestion.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';

@Component({
  selector: 'app-suggestion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.scss']
})
export class SuggestionComponent implements OnInit {
  suggestions: Suggestion[] = [];
  isLoading = false;
  isSubmitting = false;
  currentPage = 1;
  totalPages = 1;
  totalDocs = 0;
  hasPrevPage = false;
  hasNextPage = false;
  showSuggestionModal = false;
  showDetailModal = false;
  suggestionForm!: FormGroup;
  selectedSuggestion: Suggestion | null = null;

  constructor(
    private suggestionService: SuggestionService,
    private fb: FormBuilder,
    private storage: AppStorage
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSuggestions();
  }

  private initializeForm(): void {
    this.suggestionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      details: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async loadSuggestions(): Promise<void> {
    this.isLoading = true;
    try {
      const userId = this.getUserId();
      const response: SuggestionResponse = await this.suggestionService.getSuggestions(userId, this.currentPage);
      
      if (response.success && response.data) {
        this.suggestions = response.data.docs || [];
        this.totalDocs = response.data.totalDocs || 0;
        this.totalPages = response.data.totalPages || 1;
        this.currentPage = response.data.page || 1;
        this.hasPrevPage = response.data.hasPrevPage || false;
        this.hasNextPage = response.data.hasNextPage || false;
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      await swalHelper.showToast('Failed to load suggestions', 'error');
      this.suggestions = [];
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
      this.loadSuggestions();
    }
  }

  openSuggestionModal(): void {
    this.suggestionForm.reset();
    this.showSuggestionModal = true;
  }

  closeSuggestionModal(): void {
    this.showSuggestionModal = false;
    this.suggestionForm.reset();
  }

  async onSubmitSuggestion(): Promise<void> {
    if (this.suggestionForm.invalid) {
      Object.keys(this.suggestionForm.controls).forEach(key => {
        this.suggestionForm.get(key)?.markAsTouched();
      });
      await swalHelper.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    this.isSubmitting = true;
    try {
      const userId = this.getUserId();
      const suggestionData = {
        userId: userId,
        title: this.suggestionForm.value.title,
        details: this.suggestionForm.value.details,
        category: this.suggestionForm.value.category
      };

      const response = await this.suggestionService.createSuggestion(suggestionData);
      
      if (response.success) {
        await swalHelper.showToast(response.message || 'Suggestion submitted successfully', 'success');
        this.closeSuggestionModal();
        // Reload suggestions to show the new one
        await this.loadSuggestions();
      } else {
        throw new Error(response.message || 'Failed to submit suggestion');
      }
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      await swalHelper.showToast(error.message || 'Failed to submit suggestion', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  viewSuggestionDetails(suggestion: Suggestion): void {
    this.selectedSuggestion = suggestion;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedSuggestion = null;
  }

  getCategoryClass(category: string): string {
    return `category-${category}`;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
}
