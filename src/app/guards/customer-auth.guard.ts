import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CustomerAuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthGuard implements CanActivate {
  
  constructor(
    private customerAuthService: CustomerAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('CustomerAuthGuard: Checking authentication...');
    
    // Check if customer is authenticated
    if (this.customerAuthService.isAuthenticated()) {
      console.log('CustomerAuthGuard: User is authenticated, allowing access');
      return true;
    }
    
    console.log('CustomerAuthGuard: User is not authenticated, redirecting to login');
    // Customer is not authenticated, redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}