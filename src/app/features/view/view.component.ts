import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewScheduleComponent {
  studentCourses: any[] = [];
  isLoading: boolean = true;
  private studentId: string = '';

  constructor(private firebase: FirebaseService, private router: Router) {}

  async ngOnInit() {
    if (!this.firebase.isLoggedIn()) {
      this.router.navigate(['']);
      return;
    }
    this.studentId = this.firebase.getCurrentUser();
    await this.loadSchedule();
  }

  async loadSchedule() {
    this.isLoading = true;
    try {
      const coursesData = await this.firebase.getItemsService(`users/${this.studentId}/courses`);
      this.studentCourses = [];
      
      if (coursesData && coursesData.length > 0) {
        for (const courseItem of coursesData) {
          const courseData = courseItem.val();
          courseData.key = courseItem.key;
          this.studentCourses.push(courseData);
        }
      }
      
      console.log('Student schedule:', this.studentCourses);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      this.isLoading = false;
    }
  }
}