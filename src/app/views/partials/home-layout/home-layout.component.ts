import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SideBarComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss'],
})
export class HomeLayoutComponent implements OnInit {
  isSidebarOpen = true;

  constructor(private sidebarStateService: SidebarStateService) {}

  ngOnInit(): void {
    // Initialize sidebar state service to ensure proper state on component load
    console.log('HomeLayout initialized - Sidebar state:', this.sidebarStateService.isSidebarOpen);
    
    // Subscribe to sidebar state changes
    this.sidebarStateService.sidebarOpen$.subscribe((isOpen: boolean) => {
      this.isSidebarOpen = isOpen;
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (
      (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) &&
      event.key.toLowerCase() == 'i'
    ) {
      
      event.preventDefault();
    } else if (event.key === 'F12') {
      // Prevents F12
      event.preventDefault();
    }
  }
}
