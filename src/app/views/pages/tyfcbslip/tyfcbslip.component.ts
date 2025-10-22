import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TyfcbService, TyfcbData, TyfcbResponse, CreateTyfcbRequest } from '../../../services/tyfcbslip.service';
import { ReferralService, User } from '../../../services/referral.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-tyfcbslip',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tyfcbslip.component.html',
  styleUrls: ['./tyfcbslip.component.scss']
})
export class TyfcbslipComponent implements OnInit {
  activeTab: 'given' | 'received' = 'given';
  givenTyfcbs: TyfcbData[] = [];
  receivedTyfcbs: TyfcbData[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  showDetailModal = false;
  showTyfcbSlipModal = false;
  selectedTyfcb: TyfcbData | null = null;
  tyfcbSlipForm!: FormGroup;
  availableUsers: User[] = [];
  filteredUsers: User[] = [];
  showMemberSelect = false;
  showMemberDropdown = false;
  memberSearchTerm = '';
  selectedMemberDisplay = '';
  isLoadingUsers = false;
imageUrl: string = environment.imageUrl;
  constructor(
    private tyfcbService: TyfcbService,
    private referralService: ReferralService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadActiveTabData();
  }

  private initializeForm(): void {
    this.tyfcbSlipForm = this.fb.group({
      receiverType: ['inChapter', Validators.required],
      receiverId: ['', Validators.required],
      amount: [{ value: '', disabled: false }, [Validators.required, Validators.min(0.01)]],
      currency: ['INR', Validators.required],
      referral_type: ['Inside', Validators.required],
      business_type: ['New', Validators.required],
      comments: [''] // Optional
    });
  }

  switchTab(tab: 'given' | 'received'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadActiveTabData();
  }

  async loadActiveTabData(): Promise<void> {
    this.isLoading = true;
    try {
      if (this.activeTab === 'given') {
        await this.loadGivenTyfcbs();
      } else {
        await this.loadReceivedTyfcbs();
      }
    } catch (error) {
      console.error('Error loading TYFCBs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadGivenTyfcbs(): Promise<void> {
    try {
      const response: TyfcbResponse = await this.tyfcbService.getTyfcbsByGiverId(this.currentPage, this.itemsPerPage);
      this.givenTyfcbs = Array.isArray(response.docs) ? response.docs : [];
      this.totalPages = response.totalPages || 1;
    } catch (error) {
      console.error('Error loading given TYFCBs:', error);
      this.givenTyfcbs = [];
    }
  }

  async loadReceivedTyfcbs(): Promise<void> {
    try {
      const response: TyfcbResponse = await this.tyfcbService.getTyfcbsByReceiverId(this.currentPage, this.itemsPerPage);
      this.receivedTyfcbs = Array.isArray(response.docs) ? response.docs : [];
      this.totalPages = response.totalPages || 1;
    } catch (error) {
      console.error('Error loading received TYFCBs:', error);
      this.receivedTyfcbs = [];
    }
  }

  get currentTyfcbs(): TyfcbData[] {
    return this.activeTab === 'given' ? this.givenTyfcbs : this.receivedTyfcbs;
  }

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
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  openTyfcbSlip(): void {
    this.tyfcbSlipForm.reset();
    this.tyfcbSlipForm.patchValue({
      receiverType: 'inChapter',
      referral_type: 'Inside',
      business_type: 'New',
      amount: '',
      currency: 'INR'
    });
    // Reset dropdown state
    this.showMemberSelect = false;
    this.availableUsers = [];
    this.filteredUsers = [];
    this.showMemberDropdown = false;
    this.memberSearchTerm = '';
    this.selectedMemberDisplay = '';
    this.isLoadingUsers = false;
    this.showTyfcbSlipModal = true;
    this.loadAvailableUsers();
  }

  async loadAvailableUsers(): Promise<void> {
    this.isLoadingUsers = true;
    const receiverType = this.tyfcbSlipForm.get('receiverType')?.value;
    try {
      if (receiverType === 'inChapter') {
        const response = await this.referralService.getInsideUsers(1, 100);
        this.availableUsers = response.docs || [];
      } else if (receiverType === 'outside') {
        const response = await this.referralService.getOutsideUsers(1, 100);
        this.availableUsers = response.docs || [];
      }
      this.filteredUsers = this.availableUsers;
      console.log('Loaded users:', this.availableUsers.length);
    } catch (error) {
      console.error('Error loading users:', error);
      this.availableUsers = [];
      this.filteredUsers = [];
    } finally {
      this.isLoadingUsers = false;
    }
  }

  onReceiverTypeChange(event: any): void {
    const receiverType = event.target.value;
    this.tyfcbSlipForm.get('receiverId')?.reset('');
    this.selectedMemberDisplay = '';
    this.showMemberSelect = true;
    this.showMemberDropdown = false;
    this.memberSearchTerm = '';
    this.loadAvailableUsers();
    if (receiverType === 'inChapter') {
      this.tyfcbSlipForm.get('referral_type')?.setValue('Inside');
    } else if (receiverType === 'outside') {
      this.tyfcbSlipForm.get('referral_type')?.setValue('Outside');
    }
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
    this.tyfcbSlipForm.patchValue({
      receiverId: user._id
    });
    this.memberSearchTerm = '';
  }

  async openDetailModal(tyfcbId: string): Promise<void> {
    try {
      const response: TyfcbResponse = await this.tyfcbService.getTyfcbById(tyfcbId);
      this.selectedTyfcb = Array.isArray(response) ? response[0] : response;
      console.log("Selected TYFCB:", this.selectedTyfcb);
      this.showDetailModal = true;
    } catch (error) {
      console.error('Error loading TYFCB detail:', error);
    }
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTyfcb = null;
  }

  closeTyfcbSlipModal(): void {
    this.showTyfcbSlipModal = false;
    this.availableUsers = [];
    this.filteredUsers = [];
    this.showMemberDropdown = false;
    this.memberSearchTerm = '';
    this.selectedMemberDisplay = '';
    this.showMemberSelect = false;
  }

  getReceiverName(tyfcb: TyfcbData): string {
    return tyfcb.receiverId?.name || 'Unknown';
  }

  async onSubmitTyfcbSlip(): Promise<void> {
    if (this.tyfcbSlipForm.invalid) {
      await swalHelper.showToast('Please fill all required fields correctly', 'error');
      return;
    }
    try {
      const formValue = this.tyfcbSlipForm.value;
      const tyfcbData: CreateTyfcbRequest = {
        receiverId: formValue.receiverId,
        amount: formValue.amount,
        currency: formValue.currency,
        referral_type: formValue.referral_type,
        business_type: formValue.business_type,
        comments: formValue.comments || ''
      };
      await this.tyfcbService.createTyfcb(tyfcbData);
      this.closeTyfcbSlipModal();
      await this.loadActiveTabData();
    } catch (error) {
      console.error('Error creating TYFCB:', error);
    }
  }
}