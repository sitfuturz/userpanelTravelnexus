// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { MemberDirectoryService, Member, City, Chapter, Badge } from '../../../services/member-directory.service';
// import { swalHelper } from 'src/app/core/constants/swal-helper';

// @Component({
//   selector: 'app-member-directory',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './member-directory.component.html',
//   styleUrls: ['./member-directory.component.scss']
// })
// export class MemberDirectoryComponent implements OnInit, OnDestroy {
//   // Data arrays
//   members: Member[] = [];
//   currentMembers: Member[] = [];
//   cities: City[] = [];
//   chapters: Chapter[] = [];
//   filteredCities: City[] = [];
//   filteredChapters: Chapter[] = [];
//   memberBadges: { [key: string]: Badge[] } = {};
  
//   // Filter states
//   selectedCity: string = '';
//   selectedChapter: string = '';
//   citySearchTerm: string = '';
//   chapterSearchTerm: string = '';
  
//   // Dropdown states
//   showCityDropdown: boolean = false;
//   showChapterDropdown: boolean = false;
  
//   // View mode
//   viewMode: 'list' | 'grid' = 'list';
  
//   // Loading states
//   isLoading: boolean = false;
//   isLoadingCities: boolean = false;
//   isLoadingChapters: boolean = false;
  
//   // Pagination
//   currentPage: number = 1;
//   totalPages: number = 1;
//   totalDocs: number = 0;
//   itemsPerPage: number = 10;
  
//   // Destroy subject
//   private destroy$ = new Subject<void>();
  
//   // Math for template
//   Math = Math;
  
//   constructor(
//     private memberDirectoryService: MemberDirectoryService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadInitialData();
//     this.setupClickOutsideListener();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//     document.removeEventListener('click', this.handleClickOutside.bind(this));
//   }

//   private setupClickOutsideListener(): void {
//     document.addEventListener('click', this.handleClickOutside.bind(this));
//   }

//   private handleClickOutside(event: Event): void {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.custom-select')) {
//       this.showCityDropdown = false;
//       this.showChapterDropdown = false;
//     }
//   }

//   private async loadInitialData(): Promise<void> {
//     try {
//       await Promise.all([
//         this.loadCities(),
//         this.loadChapters(),
//         this.loadMembers()
//       ]);
//     } catch (error) {
//       console.error('Error loading initial data:', error);
//     }
//   }

//   async loadCities(): Promise<void> {
//     this.isLoadingCities = true;
//     try {
//       const response = await this.memberDirectoryService.getCities(1, 100);
//       this.cities = response.data.docs || [];
//       this.filteredCities = [...this.cities];
//     } catch (error) {
//       console.error('Error loading cities:', error);
//       await swalHelper.showToast('Failed to load cities', 'error');
//     } finally {
//       this.isLoadingCities = false;
//     }
//   }

//   async loadChapters(): Promise<void> {
//     this.isLoadingChapters = true;
//     try {
//       const response = await this.memberDirectoryService.getChapters(1, 100);
//       this.chapters = response.data.docs || [];
//       this.updateFilteredChapters();
//     } catch (error) {
//       console.error('Error loading chapters:', error);
//       await swalHelper.showToast('Failed to load chapters', 'error');
//     } finally {
//       this.isLoadingChapters = false;
//     }
//   }

//   async loadMembers(): Promise<void> {
//     this.isLoading = true;
//     try {
//       const params: any = {
//         page: this.currentPage,
//         limit: this.itemsPerPage
//       };

//       if (this.selectedCity) {
//         params.city = this.selectedCity;
//       }
//       if (this.selectedChapter) {
//         params.chapter_name = this.selectedChapter;
//       }

//       const response = await this.memberDirectoryService.getMembers(params);
//       this.members = response.docs || [];
//       this.currentMembers = [...this.members];
//       this.totalDocs = response.totalDocs || 0;
//       this.totalPages = response.totalPages || 1;
      
//       // Load badges for each member
//       await this.loadMemberBadges();
//     } catch (error) {
//       console.error('Error loading members:', error);
//       await swalHelper.showToast('Failed to load members', 'error');
//       this.members = [];
//       this.currentMembers = [];
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   private async loadMemberBadges(): Promise<void> {
//     // Load badges for all visible members
//     const badgePromises = this.currentMembers.map(member => 
//       this.loadBadgesForMember(member._id)
//     );
//     await Promise.all(badgePromises);
//   }

//   private async loadBadgesForMember(memberId: string): Promise<void> {
//     try {
//       const response = await this.memberDirectoryService.getUserBadges(memberId);
//       if (response.data && response.data.length > 0) {
//         this.memberBadges[memberId] = response.data;
//       }
//     } catch (error) {
//       // Silently fail for individual badge loading
//       console.error(`Error loading badges for member ${memberId}:`, error);
//     }
//   }

//   // Filter methods
//   filterCities(): void {
//     if (this.citySearchTerm) {
//       this.filteredCities = this.cities.filter(city =>
//         city.name.toLowerCase().includes(this.citySearchTerm.toLowerCase()) ||
//         city.state_name.toLowerCase().includes(this.citySearchTerm.toLowerCase())
//       );
//     } else {
//       this.filteredCities = [...this.cities];
//     }
//   }

//   filterChapters(): void {
//     this.updateFilteredChapters();
    
//     if (this.chapterSearchTerm) {
//       this.filteredChapters = this.filteredChapters.filter(chapter =>
//         chapter.name.toLowerCase().includes(this.chapterSearchTerm.toLowerCase()) ||
//         chapter.city_name.toLowerCase().includes(this.chapterSearchTerm.toLowerCase())
//       );
//     }
//   }

//   private updateFilteredChapters(): void {
//     if (this.selectedCity) {
//       // Filter chapters by selected city
//       this.filteredChapters = this.chapters.filter(chapter => 
//         chapter.city_name === this.selectedCity
//       );
//     } else {
//       this.filteredChapters = [...this.chapters];
//     }
//   }

//   // Dropdown toggles
//   toggleCityDropdown(): void {
//     this.showCityDropdown = !this.showCityDropdown;
//     this.showChapterDropdown = false;
//     if (this.showCityDropdown) {
//       this.citySearchTerm = '';
//       this.filterCities();
//     }
//   }

//   toggleChapterDropdown(): void {
//     this.showChapterDropdown = !this.showChapterDropdown;
//     this.showCityDropdown = false;
//     if (this.showChapterDropdown) {
//       this.chapterSearchTerm = '';
//       this.filterChapters();
//     }
//   }

//   // Selection methods
//   selectCity(cityName: string): void {
//     this.selectedCity = cityName;
//     this.showCityDropdown = false;
//     this.citySearchTerm = '';
    
//     // Reset chapter selection if city changes
//     if (cityName) {
//       this.selectedChapter = '';
//       this.updateFilteredChapters();
//     }
    
//     // Reset to first page and reload members
//     this.currentPage = 1;
//     this.loadMembers();
//   }

//   selectChapter(chapterName: string): void {
//     // Only allow selection if no city is selected or chapter belongs to selected city
//     if (this.selectedCity) {
//       const chapter = this.chapters.find(c => c.name === chapterName);
//       if (chapter && chapter.city_name !== this.selectedCity) {
//         return; // Don't select if chapter doesn't belong to selected city
//       }
//     }
    
//     this.selectedChapter = chapterName;
//     this.showChapterDropdown = false;
//     this.chapterSearchTerm = '';
    
//     // Reset to first page and reload members
//     this.currentPage = 1;
//     this.loadMembers();
//   }

//   // View mode toggle
//   toggleView(): void {
//     this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
//   }

//   // Member actions
//   callMember(event: Event, member: Member): void {
//     event.stopPropagation();
//     if (member.mobile_number) {
//       window.location.href = `tel:${member.mobile_number}`;
//     } else {
//       swalHelper.showToast('Phone number not available', 'warning');
//     }
//   }

//   whatsappMember(event: Event, member: Member): void {
//     event.stopPropagation();
//     if (member.mobile_number) {
//       // Remove any non-numeric characters and add country code if needed
//       let phoneNumber = member.mobile_number.replace(/\D/g, '');
//       // Add country code for India if not present (assuming Indian numbers)
//       if (phoneNumber.length === 10) {
//         phoneNumber = '91' + phoneNumber;
//       }
//       const message = encodeURIComponent(`Hi ${member.name}, I found your contact through the Member Directory.`);
//       window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
//     } else {
//       swalHelper.showToast('WhatsApp number not available', 'warning');
//     }
//   }

//   viewMemberDetails(member: Member): void {
//     // Navigate to member detail page
//     this.router.navigate(['/member', member._id]);
//   }

//   // Pagination
//   goToPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//       this.loadMembers();
//       // Scroll to top
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   }

//   get paginationPages(): number[] {
//     const pages: number[] = [];
//     const maxPagesToShow = 5;
//     const halfPages = Math.floor(maxPagesToShow / 2);
    
//     let startPage = Math.max(1, this.currentPage - halfPages);
//     let endPage = Math.min(this.totalPages, this.currentPage + halfPages);
    
//     // Adjust if we're near the beginning
//     if (this.currentPage <= halfPages) {
//       endPage = Math.min(this.totalPages, maxPagesToShow);
//     }
    
//     // Adjust if we're near the end
//     if (this.currentPage + halfPages >= this.totalPages) {
//       startPage = Math.max(1, this.totalPages - maxPagesToShow + 1);
//     }
    
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
    
//     return pages;
//   }
// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/env/env.local';
import { MemberDirectoryService, Member, City, Chapter } from '../../../services/member-directory.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { UserDetailsModalComponent } from '../member-details/member-details.component';




@Component({
  selector: 'app-member-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDetailsModalComponent],
  templateUrl: './member-directory.component.html',
  styleUrls: ['./member-directory.component.scss']
})
export class MemberDirectoryComponent implements OnInit, OnDestroy {
  // Data arrays
  members: Member[] = [];
  currentMembers: Member[] = [];
  
  // Filter states
  searchTerm: string = '';
  searchInputValue: string = '';
  searchTimeout: any;
  
  // View mode
  viewMode: 'list' | 'grid' = 'list';
  
  // Loading states
  isLoading: boolean = false;
  
  // Modal state
  isModalOpen: boolean = false;
  selectedUserId: string = '';
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalDocs: number = 0;
  itemsPerPage: number = 10;
  
  // Destroy subject
  private destroy$ = new Subject<void>();
  
  // Math for template
  Math = Math;

  imageUrl: string = environment.imageUrl;

  
  
  constructor(
    private memberDirectoryService: MemberDirectoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupClickOutsideListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleClickOutside.bind(this));
    // Clear search timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  private setupClickOutsideListener(): void {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside(event: Event): void {
    // This method is kept for potential future dropdown functionality
    // Currently no dropdowns to handle, but method is referenced in setup/cleanup
  }


  private async loadInitialData(): Promise<void> {
    try {
      await this.loadMembers();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }


  async loadMembers(): Promise<void> {
    this.isLoading = true;
    try {
      const params: any = {
        page: this.currentPage,
        limit: this.itemsPerPage
      };

      if (this.searchTerm) {
        params.search = this.searchTerm;
      }

      const response = await this.memberDirectoryService.getMembers(params);
      this.members = response.data.docs || [];
      this.currentMembers = [...this.members];
      this.totalDocs = response.data.totalDocs || 0;
      this.totalPages = response.data.totalPages || 1;
    } catch (error) {
      console.error('Error loading members:', error);
      await swalHelper.showToast('Failed to load members', 'error');
      this.members = [];
      this.currentMembers = [];
    } finally {
      this.isLoading = false;
    }
  }



  // View mode toggle
  toggleView(): void {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  // Member actions
  callMember(event: Event, member: Member): void {
    event.stopPropagation();
    if (member.mobile_number) {
      window.location.href = `tel:${member.mobile_number}`;
    } else {
      swalHelper.showToast('Phone number not available', 'warning');
    }
  }

  whatsappMember(event: Event, member: Member): void {
    event.stopPropagation();
    if (member.mobile_number) {
      // Remove any non-numeric characters and add country code if needed
      let phoneNumber = member.mobile_number.replace(/\D/g, '');
      // Add country code for India if not present (assuming Indian numbers)
      if (phoneNumber.length === 10) {
        phoneNumber = '91' + phoneNumber;
      }
      const message = encodeURIComponent(`Hi ${member.name}, I found your contact through the Member Directory.`);
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    } else {
      swalHelper.showToast('WhatsApp number not available', 'warning');
    }
  }

  // Open user details modal
  openUserDetailsModal(member: Member): void {
    this.selectedUserId = member._id;
    this.isModalOpen = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  // Close user details modal
  closeUserDetailsModal(): void {
    this.isModalOpen = false;
    this.selectedUserId = '';
    // Restore body scroll
    document.body.style.overflow = '';
  }

  // Search method with debounce
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInputValue = input.value; // Update input value immediately for smooth typing
    
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout for debounced search
    this.searchTimeout = setTimeout(() => {
      this.searchTerm = this.searchInputValue; // Update search term for API call
      this.currentPage = 1; // Reset to first page
      this.loadMembers();
    }, 600); // 600ms delay
  }

  // Clear search
  clearSearch(): void {
    this.searchInputValue = '';
    this.searchTerm = '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.currentPage = 1;
    this.loadMembers();
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMembers();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfPages = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(1, this.currentPage - halfPages);
    let endPage = Math.min(this.totalPages, this.currentPage + halfPages);
    
    // Adjust if we're near the beginning
    if (this.currentPage <= halfPages) {
      endPage = Math.min(this.totalPages, maxPagesToShow);
    }
    
    // Adjust if we're near the end
    if (this.currentPage + halfPages >= this.totalPages) {
      startPage = Math.max(1, this.totalPages - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}