// src/app/guards/customer-guest.guard.ts - New file
import { Injectable, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CustomerAuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerGuestGuard implements CanActivate {
  
  constructor(
    @Inject(CustomerAuthService) private customerAuthService: CustomerAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    
    // Check if customer is already logged in
    if (this.customerAuthService.isAuthenticated()) {
      // Customer is already logged in, redirect to dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    // Customer is not logged in, allow access to login page
    return true;
  }
}