import { Component} from '@angular/core';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { Router } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';

const NORMAL_WORKLOAD = 4;

@Component({
  selector: 'app-load',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './load.component.html',
  styleUrl: './load.component.css'
})
export class LoadComponent {
  load: any[] = [];
  
  constructor(private firebase: FirebaseService, private route: Router) { }

  async ngOnInit() {
    this.firebase.clear();
    if (!this.firebase.isLoggedIn()) {
      this.route.navigate(['']);
      return;
    }

    const alainPromise = this.firebase.getItemsService("Al Ain");
    const abudhabiPromise = this.firebase.getItemsService("Abu Dhabi");
    const [alainCourses, abudhabiCourses] = await Promise.all([alainPromise, abudhabiPromise]);
    
    const allCourses = [...(alainCourses || []), ...(abudhabiCourses || [])];
    
    if (allCourses.length === 0) {
      this.load = [];
      return;
    }

    const instructorMap = new Map<string, number>();
    for (const course of allCourses) {
      const instructorName = course.val().instructor;
      instructorMap.set(instructorName, (instructorMap.get(instructorName) || 0) + 1);
    }

    this.load = Array.from(instructorMap.entries()).map(([instructor, count]) => {
      let status = '';
      if (count > NORMAL_WORKLOAD) {
        status = 'error';
      } else if (count === NORMAL_WORKLOAD) {
        status = 'warning';
      } else {
        status = 'success';
      }
      
      return {
        instructor: instructor,
        load_number: count,
        max_load: NORMAL_WORKLOAD,
        progressPercentage: Math.min((count / NORMAL_WORKLOAD) * 100, 100), 
        status: status
      };
    });

    this.load.sort((a, b) => a.instructor.localeCompare(b.instructor));
  }

  showInstructorCourses(instructor: string) {
    this.firebase.loadpage = true;
    this.firebase.selected_instructor = instructor;
    this.route.navigate(['/dashboard/more-info']);
  }
}