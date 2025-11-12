import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.css'
})
export class AddCourseComponent {
  availableCourses: any[] = [];
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
    await this.loadAllCourses();
  }

  async loadAllCourses() {
    this.isLoading = true;
    try {
      const campus = this.firebase.getCurrentUserCampus();
      
      const [availableCoursesData, studentCourses] = await Promise.all([
        this.firebase.getItemsService(campus),
        this.firebase.getItemsService(`users/${this.studentId}/courses`)
      ]);
      
      this.availableCourses = [];
      if (availableCoursesData && availableCoursesData.length > 0) {
        for (const courseItem of availableCoursesData) {
          const courseData = courseItem.val();
          courseData.key = courseItem.key;
          this.availableCourses.push(courseData);
        }
      }
      
      this.studentCourses = [];
      if (studentCourses && studentCourses.length > 0) {
        for (const courseItem of studentCourses) {
          const courseData = courseItem.val();
          courseData.key = courseItem.key;
          this.studentCourses.push(courseData);
        }
      }
      
      console.log('Available courses:', this.availableCourses);
      console.log('Student courses:', this.studentCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      this.isLoading = false;
    }
  }

  isCourseSelected(course: any): boolean {
    return this.studentCourses.some(
      studentCourse => 
        studentCourse.course_code === course.course_code && 
        studentCourse.section_number === course.section_number
    );
  }

  hasTimeConflict(course: any): boolean {
    return this.studentCourses.some(
      studentCourse => 
        studentCourse.day_pattern === course.day_pattern && 
        studentCourse.time_slot === course.time_slot
    );
  }

  async addCourse(courseToAdd: any) {
    try {
      if (this.isCourseSelected(courseToAdd)) {
        alert('You are already enrolled in this course.');
        return;
      }
      
      if (this.hasTimeConflict(courseToAdd)) {
        alert('Time conflict detected. Cannot add course.');
        return;
      }
      
      const courseData = { ...courseToAdd, addedDate: new Date().toISOString() };
      await this.firebase.addItemService(`users/${this.studentId}/courses`, courseData);
      
      const updatedCoursesData = await this.firebase.getItemsService(`users/${this.studentId}/courses`);
      
      this.studentCourses = [];
      if (updatedCoursesData && updatedCoursesData.length > 0) {
        for (const courseItem of updatedCoursesData) {
          const courseData = courseItem.val();
          courseData.key = courseItem.key;
          this.studentCourses.push(courseData);
        }
      }
      
      alert(`${courseToAdd.course_code} added successfully!`);
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course. Please try again.');
    }
  }
}