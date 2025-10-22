import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LeaderboardService, 
  LeaderboardUser, 
  LeaderboardResponse,
  LeaderboardFilters 
} from '../../../services/leaderboard.service';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {

  environment = environment;

  // Data arrays
  leaderboardData: LeaderboardUser[] = [];
  paginationData: any = null;
  
  // Filter states
  fromDate = '';
  toDate = '';
  currentPage = 1;
  
  // Loading states
  isLoading = false;
  
  // Modal states
  showDetailModal = false;
  selectedUser: LeaderboardUser | null = null;
  selectedUserRank = 0;
  
  // Current user ID for highlighting
  currentUserId = '';

  constructor(
    private leaderboardService: LeaderboardService
  ) {}

  ngOnInit(): void {
    this.getCurrentUserId();
    this.loadLeaderboardData();
  }

  // Get current user ID from token
  private getCurrentUserId(): void {
    try {
      const token = localStorage.getItem('token') || '';
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.userId;
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
  }

  // Load leaderboard data
  async loadLeaderboardData(): Promise<void> {
    this.isLoading = true;
    try {
      const filters: LeaderboardFilters = {
        page: this.currentPage,
        limit: 10,
        fromDate: this.fromDate || undefined,
        toDate: this.toDate || undefined
      };

      const response: LeaderboardResponse = await this.leaderboardService.getPointsHistory(filters);
      
      if (response.success) {
        this.leaderboardData = response.data.docs || [];
        this.paginationData = {
          totalDocs: response.data.totalDocs,
          totalPages: response.data.totalPages,
          page: response.data.page,
          hasPrevPage: response.data.hasPrevPage,
          hasNextPage: response.data.hasNextPage,
          prevPage: response.data.prevPage,
          nextPage: response.data.nextPage
        };
        
        console.log('Leaderboard data loaded:', this.leaderboardData);
        console.log('Pagination data:', this.paginationData);
      } else {
        this.leaderboardData = [];
        this.paginationData = null;
      }
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      this.leaderboardData = [];
      this.paginationData = null;
    } finally {
      this.isLoading = false;
    }
  }

  // Date filter change
  onDateFilterChange(): void {
    this.currentPage = 1;
    this.loadLeaderboardData();
  }

  // Clear date filters
  clearDateFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.currentPage = 1;
    this.loadLeaderboardData();
  }

  // Pagination
  loadPage(page: number): void {
    if (page && page !== this.currentPage) {
      this.currentPage = page;
      this.loadLeaderboardData();
    }
  }

  // Get current rank offset for pagination
  get currentRankOffset(): number {
    if (!this.paginationData) return 1;
    return (this.paginationData.page - 1) * 10 + 1;
  }

  // Modal methods
  openUserDetail(user: LeaderboardUser): void {
    this.selectedUser = user;
    this.selectedUserRank = this.leaderboardData.findIndex(u => u.userId === user.userId) + this.currentRankOffset;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedUser = null;
    this.selectedUserRank = 0;
  }

  // Check if current user
  isCurrentUser(userId: string): boolean {
    return userId === this.currentUserId;
  }

  // Get rank class for styling
  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-first';
    if (rank === 2) return 'rank-second';
    if (rank === 3) return 'rank-third';
    return 'rank-normal';
  }

  // Utility methods
  getUserImage(user: LeaderboardUser): string {
    return user.profilePic 
      ? `${this.environment.imageUrl}${user.profilePic}`
      : 'assets/images/placeholder-image.png';
  }

  // Track by function for ngFor performance
  trackByUserId(index: number, user: LeaderboardUser): string {
    return user.userId;
  }
}