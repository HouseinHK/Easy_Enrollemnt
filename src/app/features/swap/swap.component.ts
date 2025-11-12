import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-swap-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './swap.component.html',
  styleUrl: './swap.component.css'
})
export class SwapCoursesComponent {
  studentCourses: any[] = [];
  availableCourses: any[] = [];
  isLoading: boolean = true;
  sourceKey: string = '';
  targetKey: string = '';
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
      
      const [studentCoursesData, availableCoursesData] = await Promise.all([
        this.firebase.getItemsService(`users/${this.studentId}/courses`),
        this.firebase.getItemsService(campus)
      ]);
      
      this.studentCourses = [];
      if (studentCoursesData && studentCoursesData.length > 0) {
        for (const courseItem of studentCoursesData) {
          const courseData = courseItem.val();
          courseData.key = courseItem.key;
          this.studentCourses.push(courseData);
        }
      }
      
      this.availableCourses = [];
      if (availableCoursesData && availableCoursesData.length > 0) {
        for (const courseItem of availableCoursesData) {
          const courseData = courseItem.val();
          courseData.key = courseItem.key;
          this.availableCourses.push(courseData);
        }
      }
      
      console.log('Student courses:', this.studentCourses);
      console.log('Available courses:', this.availableCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async swap() {
    if (!this.sourceKey || !this.targetKey) {
      alert('You must select a course to drop and a course to add.');
      return;
    }
    
    try {
      const courseToAdd = this.availableCourses.find(c => c.key === this.targetKey);
      if (!courseToAdd) {
        alert('Selected course to add not found.');
        return;
      }
      
      const tempStudentCourses = this.studentCourses.filter(c => c.key !== this.sourceKey);
      
      for (const enrolled of tempStudentCourses) {
        if (enrolled.day_pattern === courseToAdd.day_pattern && 
            enrolled.time_slot === courseToAdd.time_slot) {
          alert('Swap creates a time conflict!');
          return;
        }
      }
      
      await this.firebase.deleteFromList(`users/${this.studentId}/courses`, this.sourceKey);
      const courseData = { ...courseToAdd, addedDate: new Date().toISOString() };
      await this.firebase.addItemService(`users/${this.studentId}/courses`, courseData);
      
      alert('Swap successful!');
      this.sourceKey = '';
      this.targetKey = '';
      await this.loadAllCourses();
    } catch (error) {
      console.error('Error during course swap:', error);
      alert('Failed to swap courses. Please try again.');
    }
  }
}