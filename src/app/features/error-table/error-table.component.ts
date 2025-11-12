import { Component } from '@angular/core';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-table.component.html',
  styleUrl: './error-table.component.css'
})
export class ErrorTableComponent {
  item: any[];
  errors: any[];
  selectedError: any = null;
  
  constructor(private firebase: FirebaseService, private route: Router)
  {
    this.item = [];
    this.errors = [];
  }

 async ngOnInit()
 {
    this.firebase.clear();

    if (this.item != null || this.errors != null)
    {
      this.item = [];
      this.errors = [];
    }

    const AlAin = await this.firebase.getItemsService("Al Ain");
    const AbuDhabi = await this.firebase.getItemsService("Abu Dhabi");
    for (let i = 0; i < AlAin.length; i++)
    {
      this.item.push(AlAin[i]);
    }
    for (let j = 0; j < AbuDhabi.length; j++)
    {
      this.item.push(AbuDhabi[j]);
    }
    this.error_checker();
    this.warning_checker(AlAin, AbuDhabi);
 }

 showInfo(error: any) {
   this.selectedError = error;
 }

 closeInfo() {
   this.selectedError = null;
 }

 showMoreInfo() {
   if (!this.selectedError) return;
   
   this.firebase.from_error = true;
   this.firebase.selected_error = this.selectedError;
   this.route.navigate(['/dashboard/more-info']);
 }

 async error_checker()
 {
    for (let i = 0; i < this.item.length-1; i++) 
    {
      for (let j = i + 1; j < this.item.length; j++) 
      {
        if (!this.item[i] || !this.item[i].val || !this.item[j] || !this.item[j].val) 
        {
          continue;
        }

        if (this.item[i].val().instructor === this.item[j].val().instructor) 
        {

          if (this.item[i].val().campus !== this.item[j].val().campus) 
          {
            if (this.item[i].val().time_slot === this.item[j].val().time_slot && 
                this.item[i].val().day_pattern === this.item[j].val().day_pattern) 
            {
              this.errors.push({
                type: `error1 with Dr. ${this.item[i].val().instructor}`,
                message: `Dr. ${this.item[i].val().instructor} has a time conflict: assigned to both ${this.item[i].val().campus} and ${this.item[j].val().campus} during Slot ${this.item[i].val().time_slot} (${this.item[i].val().day_pattern} ${this.item[i].val().time}).`,
                item_first: this.item[i].val(),
                item_second: this.item[j].val()
              });
            }
          }

          if (this.item[i].val().campus === this.item[j].val().campus)
          {
            if (this.item[i].val().time_slot === this.item[j].val().time_slot && 
                this.item[i].val().day_pattern === this.item[j].val().day_pattern) 
            {
              this.errors.push({
                type: `error2 wtih Dr. ${this.item[i].val().instructor}`,
                message: `Dr. ${this.item[i].val().instructor} has a time conflict: assigned to two sessions in ${this.item[i].val().campus} during Slot ${this.item[i].val().time_slot} (${this.item[i].val().day_pattern} ${this.item[i].val().time}).`,
                item_first: this.item[i].val()
              });
            }
          }
        } 
      }
    }  
 }

 async warning_checker(AlAin: any[], AbuDhabi: any[])
 {
    const AlAin_courses = new Set();
    const AbuDhabi_courses = new Set();

    for (let i = 0; i < AlAin.length; i++)
    {
      AlAin_courses.add(AlAin[i].val().course_code);
    }
     for (let i = 0; i < AbuDhabi.length; i++)
    {
      AbuDhabi_courses.add(AbuDhabi[i].val().course_code);
    }

     AlAin_courses.forEach((course: any) => {
      if (!AbuDhabi_courses.has(course)) {
        this.errors.push({
          type: `warning with course: ${course} `,
          message: `Warning: ${course} is offered in Al Ain but not in Abu Dhabi. Please verify if it should also be scheduled in Abu Dhabi.`,
          item: {course_code: course, campus: "Al Ain"}
        });
      }
    });
    
    AbuDhabi_courses.forEach((course: any) => {
      if (!AlAin_courses.has(course)) {
        this.errors.push({
          type: `warning with course: ${course}`,
          message: `Warning: ${course} is offered in Abu Dhabi but not in Al Ain. Please verify if it should also be scheduled in Al Ain.`,
          item: {course_code: course, campus: "Abu Dhabi"}
        });
      }
    });
 }
}

