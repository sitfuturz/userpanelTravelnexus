import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { swalHelper } from '../../../core/constants/swal-helper';
import { CustomerAuthService } from '../../../services/auth.service';
import { DigitOnlyDirective } from '../../../core/directives/digit-only';
import { ProfileService, Region } from '../../../services/profile.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customer-login.component.html',
  styleUrls: ['./customer-login.component.css'],
})
export class CustomerLoginComponent {
  mobileNumber: string = '';
  isLoading: boolean = false;
  // Signup modal state
  showSignup: boolean = false;
  signupForm!: FormGroup;
  availableRegions: Region[] = [];
  availableCountries: Array<{_id: string; name: string}> = [];
  availableStates: Array<{_id: string; name: string; country_name?: string}> = [];
  availableCities: Array<{_id: string; name: string; state_name?: string}> = [];
  specializations: string[] = [];
  servicesOffered: string[] = [];
  // Wizard state
  currentStep: number = 1;
  totalSteps: number = 7; // 6 steps + review (specializations and services split)
  
  constructor(
    private router: Router,
    private authService: CustomerAuthService,
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {
    this.initSignupForm();
    this.loadStaticOptions();
  }

  private initSignupForm(): void {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      mobile_number: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      business_name: ['', Validators.required],
      business_type: ['B2B', Validators.required],
      regions: [[]], // array of region ids
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      date_of_birth: [null],
      dmc_specializations: [[]],
      services_offered: [[]]
    });
  }

  private async loadStaticOptions(): Promise<void> {
    this.specializations = this.profileService.getAvailableSpecializations();
    this.servicesOffered = this.profileService.getAvailableServices();
    // preload lists
    this.availableRegions = await this.profileService.getAllRegions();
    this.availableCountries = await this.profileService.getAllCountries();
    this.availableStates = await this.profileService.getAllStates();
    this.availableCities = await this.profileService.getAllCities();
  }

  openSignup(): void {
    this.showSignup = true;
    this.currentStep = 1;
  }

  closeSignup(): void {
    this.showSignup = false;
    this.signupForm.reset({ business_type: 'B2B', regions: [], dmc_specializations: [], services_offered: [] });
  }

  async onSubmitSignup(): Promise<void> {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach(k => this.signupForm.get(k)?.markAsTouched());
      await swalHelper.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    try {
      const payload = {
        name: this.signupForm.value.name,
        mobile_number: this.signupForm.value.mobile_number,
        business_name: this.signupForm.value.business_name,
        business: [{ business_name: this.signupForm.value.business_name, business_type: this.signupForm.value.business_type, primary_business: true }],
        regions: this.signupForm.value.regions,
        country: this.signupForm.value.country,
        state: this.signupForm.value.state,
        city: this.signupForm.value.city,
        email: this.signupForm.value.email,
        date_of_birth: this.signupForm.value.date_of_birth,
        dmc_specializations: this.signupForm.value.dmc_specializations,
        services_offered: this.signupForm.value.services_offered
      };
      const newUser = await this.profileService.registerUser(payload);
      await swalHelper.showToast('Registered successfully. Please login.', 'success');
      this.closeSignup();
    } catch (e) {
      // error toast handled in service
    }
  }

  // Wizard helpers
  getProgressPercent(): number {
    return Math.round(((this.currentStep - 1) / (this.totalSteps - 1)) * 100);
  }

  private getStepFields(step: number): string[] {
    switch (step) {
      case 1:
        return ['name', 'mobile_number', 'email', 'date_of_birth'];
      case 2:
        return ['business_name', 'business_type'];
      case 3:
        return ['regions'];
      case 4:
        return ['country', 'state', 'city'];
      case 5:
        return ['dmc_specializations'];
      case 6:
        return ['services_offered'];
      default:
        return [];
    }
  }

  private isStepValid(step: number): boolean {
    const fields = this.getStepFields(step);
    let valid = true;
    fields.forEach(ctrl => {
      const control = this.signupForm.get(ctrl);
      if (control) {
        control.markAsTouched();
        if (control.invalid) valid = false;
      }
    });
    return valid;
  }

  async nextStep(): Promise<void> {
    if (!this.isStepValid(this.currentStep)) {
      await swalHelper.showToast('Please complete this step before continuing', 'warning');
      return;
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep += 1;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  async sendOtp() {
    console.log('sendOtp called with mobile number:', this.mobileNumber);
    
    if (!this.validateMobileNumber()) {
      console.log('Mobile number validation failed');
      return;
    }

    this.isLoading = true;
    try {
      console.log('Calling authService.sendLoginOtp...');
      const success = await this.authService.sendLoginOtp(this.mobileNumber);
      console.log('sendLoginOtp returned:', success);
      
      if (success) {
        console.log('OTP sent successfully, navigating to verification...');
        // Navigate to verification screen with mobile number as query param
        await this.router.navigate(['/verification'], {
          queryParams: { mobile: this.mobileNumber }
        });
        console.log('Navigation completed');
      } else {
        console.log('OTP sending failed');
        // Show error message if OTP sending failed
        swalHelper.showToast('Failed to send OTP. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      swalHelper.showToast('An error occurred. Please try again.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  validateMobileNumber(): boolean {
    if (!this.mobileNumber) {
      swalHelper.showToast('Please enter mobile number', 'warning');
      return false;
    }
    
    if (this.mobileNumber.length !== 10) {
      swalHelper.showToast('Please enter valid 10-digit mobile number', 'warning');
      return false;
    }
    
    return true;
  }

  // Signup helpers
  toggleRegion(regionId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement)?.checked === true;
    const current: string[] = [...(this.signupForm.value.regions || [])];
    const idx = current.indexOf(regionId);
    if (checked && idx === -1) current.push(regionId);
    if (!checked && idx > -1) current.splice(idx, 1);
    this.signupForm.patchValue({ regions: current });
  }

  toggleSpec(spec: string, event: Event): void {
    const checked = (event.target as HTMLInputElement)?.checked === true;
    const current: string[] = [...(this.signupForm.value.dmc_specializations || [])];
    const idx = current.indexOf(spec);
    if (checked && idx === -1) current.push(spec);
    if (!checked && idx > -1) current.splice(idx, 1);
    this.signupForm.patchValue({ dmc_specializations: current });
  }

  toggleService(svc: string, event: Event): void {
    const checked = (event.target as HTMLInputElement)?.checked === true;
    const current: string[] = [...(this.signupForm.value.services_offered || [])];
    const idx = current.indexOf(svc);
    if (checked && idx === -1) current.push(svc);
    if (!checked && idx > -1) current.splice(idx, 1);
    this.signupForm.patchValue({ services_offered: current });
  }
}