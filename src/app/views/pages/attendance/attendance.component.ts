import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AttendanceService, 
  AttendanceRecord, 
  AttendanceSummary,
  AttendanceEvent,
  AttendanceResponse 
} from '../../../services/attendance.service';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  environment = environment;

  // Data arrays
  attendanceRecords: AttendanceRecord[] = [];
  filteredAttendance: AttendanceRecord[] = [];
  attendanceSummary: AttendanceSummary | null = null;
  
  // Search
  searchQuery = '';
  
  // Loading states
  isLoading = false;
  
  // Modal states
  showDetailModal = false;
  selectedEvent: AttendanceEvent | null = null;
  selectedAttendanceRecord: AttendanceRecord | null = null;

  constructor(
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.loadAttendanceData();
  }

  // Load attendance data
  async loadAttendanceData(): Promise<void> {
    this.isLoading = true;
    try {
      const response: AttendanceResponse = await this.attendanceService.getAllAttendance();
      
      if (response) {
        this.attendanceRecords = response.data.docs || [];
        this.attendanceSummary = response.data.summary;
        this.filteredAttendance = [...this.attendanceRecords];
      } else {
        this.attendanceRecords = [];
        this.filteredAttendance = [];
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      this.attendanceRecords = [];
      this.filteredAttendance = [];
    } finally {
      this.isLoading = false;
    }
  }

  // Search functionality
  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredAttendance = [...this.attendanceRecords];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredAttendance = this.attendanceRecords.filter(record => 
      record.event.name.toLowerCase().includes(query) ||
      record.status.toLowerCase().includes(query) ||
      this.formatDate(record.event.date).toLowerCase().includes(query)
    );
  }

  // Modal methods
  openEventDetail(event: AttendanceEvent): void {
    this.selectedEvent = event;
    this.selectedAttendanceRecord = this.attendanceRecords.find(
      record => record.event._id === event._id
    ) || null;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEvent = null;
    this.selectedAttendanceRecord = null;
  }

  // Utility methods
  getEventImage(event: AttendanceEvent): string {
    return event.thumbnail 
      ? `${this.environment.imageUrl}${event.thumbnail}`
      : 'assets/images/placeholder-image.png';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatEventType(type: string): string {
    if (!type) return 'Event';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  getAttendancePercentage(): number {
    if (!this.attendanceSummary) return 0;
    
    const total = this.attendanceSummary.totalPresent + this.attendanceSummary.totalAbsent;
    if (total === 0) return 0;
    
    return Math.round((this.attendanceSummary.totalPresent / total) * 100);
  }

  // Track by function for ngFor performance
  trackByRecordId(index: number, record: AttendanceRecord): string {
    return record.event._id;
  }
}