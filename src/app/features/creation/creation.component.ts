import { Component } from '@angular/core';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { Router } from '@angular/router';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { MFormUlaComponent } from '../../m-framework/components/m-form-ula/m-form-ula.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-creation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './creation.component.html',
  styleUrl: './creation.component.css'
})
export class CreationComponent {
  instructor: string;
  section_number: number;
  expected_capacity: string;
  time_slot: number;
  campus: string;

  time: string;
  day_pattern: string;
  course_code: string;
  
  showNotification: boolean = false;

 slots: {num: number, time: string}[] = []; 

  ngOnInit() {
    if (!this.firebase.isLoggedIn()) {
      this.route.navigate(['']);
      return;
    }
    console.log(this.slots);
    this.firebase.clear();
  }
  constructor(private firebase: FirebaseService, private route: Router)
  {
    this.instructor = '';
    this.section_number = 0;
    this.expected_capacity = '';
    this.time_slot = 0;
    this.campus = ''

    this.time = '';
    this.day_pattern = '';
    this.course_code = '';
  }

  async add_button()
  {
    if ( ((await this.firebase.getItemsService("Al Ain")).length > 14
       || (await this.firebase.getItemsService("Abu Dhabi")).length > 14) )
    {
      return;
    }
    const object = {
      instructor: this.instructor, 
      section_number: this.section_number,
      expected_capacity: this.expected_capacity, 
      time_slot: this.time_slot, 
      campus: this.campus, 
      time: this.time, 
      day_pattern: this.day_pattern, 
      course_code: this.course_code 
    };
    await this.firebase.addItemService(this.campus, object);
    
    // Show notification
    this.showNotification = true;
    
    // Reset form fields
    this.instructor = '';
    this.section_number = 0;
    this.expected_capacity = '';
    this.time_slot = 0;
    this.time = '';
    this.day_pattern = '';
    this.course_code = '';
    this.slots = [];
    
    // Hide notification after 5 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 5000);
  }

  day()
  {
    if (this.day_pattern == "MW")
    {
      this.slots = this.firebase.slots_MW;
    }else if (this.day_pattern == "TR")
    {
      this.slots = this.firebase.slots_TR;
    }else
    {
      this.slots = [];
    }
  }
}
