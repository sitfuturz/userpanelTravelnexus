import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberDirectoryService } from '../../../services/member-directory.service';
import { environment } from 'src/env/env.local';
import { swalHelper } from 'src/app/core/constants/swal-helper';

@Component({
  selector: 'app-user-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class UserDetailsModalComponent implements OnInit, OnChanges {
  @Input() userId: string = '';
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  userDetails: any = null;
  isLoading: boolean = false;

  imageUrl: string = environment.imageUrl;

  constructor(private memberDirectoryService: MemberDirectoryService) {}

  ngOnInit(): void {
    if (this.userId && this.isOpen) {
      this.loadUserDetails();
    }
  }

  ngOnChanges(): void {
    if (this.userId && this.isOpen) {
      this.loadUserDetails();
    }
  }

  async loadUserDetails(): Promise<void> {
    this.isLoading = true;
    try {
      const detailsResponse = await this.memberDirectoryService.getUserDetails(this.userId);
      this.userDetails = detailsResponse.data;
    } catch (error) {
      console.error('Error loading user details:', error);
      await swalHelper.showToast('Failed to load user details', 'error');
      this.close();
    } finally {
      this.isLoading = false;
    }
  }

  close(): void {
    this.closeModal.emit();
  }


  callUser(): void {
    if (this.userDetails?.mobile_number) {
      window.location.href = `tel:${this.userDetails.mobile_number}`;
    } else {
      swalHelper.showToast('Phone number not available', 'warning');
    }
  }

  emailUser(): void {
    if (this.userDetails?.email) {
      window.location.href = `mailto:${this.userDetails.email}`;
    } else {
      swalHelper.showToast('Email not available', 'warning');
    }
  }

  whatsappUser(): void {
    if (this.userDetails?.mobile_number) {
      let phoneNumber = this.userDetails.mobile_number.replace(/\D/g, '');
      if (phoneNumber.length === 10) {
        phoneNumber = '91' + phoneNumber;
      }
      const message = encodeURIComponent(`Hi ${this.userDetails.name}, I found your contact through the Member Directory.`);
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    } else {
      swalHelper.showToast('WhatsApp number not available', 'warning');
    }
  }

  shareProfile(): void {
    if (navigator.share && this.userDetails) {
      navigator.share({
        title: this.userDetails.name,
        text: `Check out ${this.userDetails.name}'s profile`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        swalHelper.showToast('Link copied to clipboard', 'success');
      });
    }
  }

  openSocialMedia(platform: string): void {
    const url = this.userDetails?.SocialMedia?.[platform];
    if (url) {
      window.open(url, '_blank');
    }
  }


  getProfilePicUrl(profilePic: string): string {
    if (!profilePic) return 'assets/images/placeholder-avatar.png';
    //return `https://gbs-connect.com/${profilePic}`;
    return `${this.imageUrl.replace(/\/$/, '')}/${profilePic.replace(/^\//, '')}`;
  }

  hasSocialMedia(): boolean {
    if (!this.userDetails?.SocialMedia) return false;
    return Object.values(this.userDetails.SocialMedia).some(url => url && url !== '');
  }
}