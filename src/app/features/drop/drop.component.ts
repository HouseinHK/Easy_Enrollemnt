import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drop-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drop.component.html',
  styleUrl: './drop.component.css'
})
export class DropCourseComponent {
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
    await this.loadStudentCourses();
  }

  async loadStudentCourses() {
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
      
      console.log('Student courses:', this.studentCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async dropCourse(courseToDrop: any) {
    try {
      if (confirm(`Are you sure you want to drop ${courseToDrop.course_code}?`)) {
        await this.firebase.deleteFromList(`users/${this.studentId}/courses`, courseToDrop.key);
        await this.loadStudentCourses();
      }
    } catch (error) {
      console.error('Error dropping course:', error);
      alert('Failed to drop course. Please try again.');
    }
  }
}