import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerAuthService } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { common } from '../../../core/constants/common';
import { timer, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DigitOnlyDirective } from '../../../core/directives/digit-only';

@Component({
  selector: 'app-verification',
    standalone: true,  
    imports: [FormsModule, CommonModule], 
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit, OnDestroy {
  otp: string[] = ['', '', '', ''];
  isLoading: boolean = false;
  isResendLoading: boolean = false;
  mobileNumber: string = '';
  resendCooldown: number = 30;
  private countdownSubscription?: Subscription;

  constructor(
    private authService: CustomerAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('VerificationComponent ngOnInit called');
    this.route.queryParams.subscribe(params => {
      console.log('Query params received:', params);
      this.mobileNumber = params['mobile'] || '';
      console.log('Mobile number from params:', this.mobileNumber);
      
      if (!this.mobileNumber) {
        console.log('No mobile number found, redirecting to login');
        this.router.navigate(['/login']);
        return;
      } else {
        console.log('Mobile number found, starting countdown');
      }
    });
    this.startResendCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  startResendCountdown(): void {
    this.countdownSubscription = timer(0, 1000).subscribe(() => {
      if (this.resendCooldown > 0) {
        this.resendCooldown--;
      } else if (this.countdownSubscription) {
        this.countdownSubscription.unsubscribe();
      }
    });
  }

  isOtpComplete(): boolean {
    const isComplete = this.otp.every(digit => digit !== '' && digit.length === 1) && this.otp.length === 4;
    console.log('Checking OTP complete:', this.otp, 'Result:', isComplete);
    return isComplete;
  }

  onOtpInput(event: any, index: number): void {
    const input = event.target;
    let value = input.value;
    
    console.log('Input event - Index:', index, 'Value:', value, 'Current OTP:', [...this.otp]);
    
    // Remove any non-digit characters and limit to 1 character
    value = value.replace(/[^0-9]/g, '').slice(0, 1);
    
    // Clear the input first to prevent any placeholder behavior
    input.value = '';
    
    // Update the model and input with the clean value
    this.otp[index] = value;
    input.value = value;
    
    console.log('After processing - Value:', value, 'Updated OTP:', [...this.otp]);
    
    // Move to next input if value is entered and not the last input
    if (value && index < 3) {
      setTimeout(() => {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          // Ensure next input is clean
          nextInput.value = this.otp[index + 1] || '';
        }
      }, 10);
    }
    
    // Trigger change detection
    setTimeout(() => {
      console.log('Final OTP check:', this.otp, 'Complete:', this.isOtpComplete());
    }, 50);
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    
    console.log('Keydown event - Key:', event.key, 'Index:', index, 'Current value:', this.otp[index]);
    
    // Prevent non-digit keys except navigation and control keys
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!allowedKeys.includes(event.key) && (event.key < '0' || event.key > '9')) {
      event.preventDefault();
      return;
    }
    
    // Handle backspace
    if (event.key === 'Backspace') {
      event.preventDefault();
      
      if (this.otp[index]) {
        // Clear current input
        this.otp[index] = '';
        input.value = '';
      } else if (index > 0) {
        // Move to previous input and clear it
        const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (prevInput) {
          this.otp[index - 1] = '';
          prevInput.value = '';
          prevInput.focus();
        }
      }
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
    
    if (event.key === 'ArrowRight' && index < 3) {
      event.preventDefault();
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // Handle digit input - replace current value
    if (event.key >= '0' && event.key <= '9') {
      event.preventDefault();
      
      // Clear input first to prevent placeholder behavior
      input.value = '';
      
      // Set the new value
      this.otp[index] = event.key;
      input.value = event.key;
      
      // Move to next input
      if (index < 3) {
        setTimeout(() => {
          const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
            // Ensure next input shows correct value
            nextInput.value = this.otp[index + 1] || '';
          }
        }, 10);
      }
    }
  }

  async verifyOtp(): Promise<void> {
    if (!this.isOtpComplete()) {
      await swalHelper.showToast('Please enter complete OTP', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      const otpCode = this.otp.join('');
      await this.authService.verifyOtpAndLogin(this.mobileNumber, otpCode);
      // Navigation is now handled by the auth service
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async resendOtp(): Promise<void> {
    if (this.resendCooldown > 0) return;

    this.isResendLoading = true;
    try {
      const success = await this.authService.resendOtp(this.mobileNumber);
      if (success) {
        this.resendCooldown = 30;
        this.startResendCountdown();
        
        // Clear the OTP array
        this.otp = ['', '', '', ''];
        
        // Clear all input fields manually
        for (let i = 0; i < 4; i++) {
          const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
          if (input) {
            input.value = '';
          }
        }
        
        // Focus on first input
        const firstInput = document.getElementById('otp-0') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
        
        console.log('OTP fields cleared after resend');
      }
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      this.isResendLoading = false;
    }
  }

  // Helper method to clear all OTP inputs
  clearOtpInputs(): void {
    this.otp = ['', '', '', ''];
    for (let i = 0; i < 4; i++) {
      const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    }
  }
}