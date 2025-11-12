import { Component } from '@angular/core';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { Router } from '@angular/router';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-more-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './more-info.component.html',
  styleUrl: './more-info.component.css'
})
export class MoreInfoComponent {
  AlAin_checker: boolean;

  instructor: string;
  section_number: number;
  time_slot: number;

  item: any[];
  selection: any[];
  filteredSelection: any[];
  searchTerm: string;
  from_deletion: boolean = this.firebase.from_deletion;
  load: boolean = this.firebase.loadpage;
  error: boolean = this.firebase.from_error;

  constructor(private firebase: FirebaseService, private route: Router)
  {
    this.AlAin_checker = true;

    this.instructor = '';
    this.section_number = 0;
    this.time_slot = 0;

    this.item = [];
    this.selection = [];
    this.filteredSelection = [];
    this.searchTerm = '';
  }

  clear()
  {
    this.item = [];
    this.selection = [];
    this.filteredSelection = [];
  } 
  
  async ngOnInit()
  {
    if (!this.firebase.isLoggedIn()) {
      this.route.navigate(['']);
      return;
    }
    if (this.item != null || this.selection != null || this.filteredSelection != null)
    {
      this.clear();
    }

    if (this.firebase.al_ain == true)
    {
      this.item = await this.firebase.getItemsService("Al Ain");
    } 

    else if (this.firebase.abu_dhabi == true)
    {
      this.item = await this.firebase.getItemsService("Abu Dhabi");
    }
    
    else if ((this.from_deletion == true) || (this.load == true) || (this.error == true))
    {
      const alain = await this.firebase.getItemsService("Al Ain");
      const abudhabi = await this.firebase.getItemsService("Abu Dhabi");

      for (let i = 0; i < alain.length; i++)
      {
        this.item.push(alain[i]);
      }
      for (let i = 0; i < abudhabi.length; i++)
      {
        this.item.push(abudhabi[i])
      }
    }else 
    {
      this.clear();
    }

    if (this.from_deletion == true) {
  for (let i = 0; i < this.item.length; i++) {
    let matches = true; 
    
    if (this.firebase.search_object.instructor && 
        !this.item[i].val().instructor.toLowerCase().includes(this.firebase.search_object.instructor.toLowerCase())) {
      matches = false;
    }
    if (this.firebase.search_object.section_number && 
        this.item[i].val().section_number.toString() !== this.firebase.search_object.section_number.toString()) {
      matches = false;
    }
    if (this.firebase.search_object.course_code && 
        !this.item[i].val().course_code.toLowerCase().includes(this.firebase.search_object.course_code.toLowerCase())) {
      matches = false;
    }
    if (this.firebase.search_object.campus !== "" && 
        this.item[i].val().campus.toLowerCase() !== this.firebase.search_object.campus.toLowerCase()) {
      matches = false;
    }
    if (this.firebase.search_object.expected_capacity !== "" &&
        this.item[i].val().expected_capacity.toLowerCase() !== this.firebase.search_object.expected_capacity.toLowerCase()) {
      matches = false;
    }
    if (this.firebase.search_object.time_slot && 
        this.item[i].val().time_slot.toString() !== this.firebase.search_object.time_slot.toString()) {
      matches = false;
    }
    if (this.firebase.search_object.day_pattern !== "" &&
        this.item[i].val().day_pattern.toLowerCase() !== this.firebase.search_object.day_pattern.toLowerCase()) {
      matches = false;
    }
    
    if (matches) {
      this.selection.push(this.item[i].val());
    }
  }
}else if (this.load == true)
    {
      for (let i = 0; i<this.item.length; i++)
      {
        if (this.item[i].val().instructor == this.firebase.selected_instructor)
        {
          this.selection.push(this.item[i].val());
        }
      }
    }else if (this.error == true)
    {
      const error = this.firebase.selected_error;
      
      if (error.type.includes("error1")) { 
        for (let i = 0; i<this.item.length; i++)
        {
          if ( (this.item[i].val().instructor == error.item_first.instructor) &&
               (this.item[i].val().time_slot == error.item_first.time_slot))
          {
            this.selection.push(this.item[i].val());
          }
        }
      }
      else if (error.type.includes("error2")) {
      
        for (let i = 0; i<this.item.length; i++)
        {
          if ( (this.item[i].val().instructor == error.item_first.instructor) &&
               (this.item[i].val().campus == error.item_first.campus) &&
               (this.item[i].val().time_slot == error.item_first.time_slot))
          {
            this.selection.push(this.item[i].val());
          }
        }
      }

      else if (error.type.includes("warning")) {
        if (error.item.campus.includes("Al Ain"))
          {
            for (let i = 0; i<this.item.length; i++)
            {
              if (this.item[i].val().course_code == error.item.course_code)
              {
                this.selection.push(this.item[i].val());
              }
            }
          }else if (error.item.campus.includes("Abu Dhabi"))
          {
            for (let i = 0; i<this.item.length; i++)
            {
              if (this.item[i].val().course_code == error.item.course_code)
              {
                this.selection.push(this.item[i].val());
              }
            } 
          }
        
      }
    }else
    {
      for (let i = 0; i<this.item.length; i++)
      {
        if (this.item[i].val().time_slot == this.firebase.slot_button)
        {
          this.selection.push(this.item[i].val());
        }
      }
    }
   
    this.filteredSelection = [...this.selection];
    console.log('Selection data:', this.selection);
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredSelection = [...this.selection];
      return;
    }

    this.filteredSelection = this.selection.filter(course =>
      course.instructor.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      course.campus.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      course.section_number.toString().includes(this.searchTerm) ||
      course.day_pattern.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      course.expected_capacity.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  goBack() {
    let location = "schedule";
    if (this.firebase.from_deletion == true)
    {
      location = "deletion";
      this.firebase.from_deletion = false;
    }else if (this.load == true)
    {
      location = "load";
      this.firebase.loadpage = false;
    }else if (this.error == true)
    {
      location = "error-table";
      this.firebase.from_error = false;
    }

    this.route.navigate(['/dashboard/' + location]);
  }

 delete(course: any)
  {
    for (let i = 0; i < this.item.length; i++) {
      const itemData = this.item[i].val();
      
      if (itemData.campus === course.campus && 
          itemData.time_slot === course.time_slot &&
          itemData.section_number === course.section_number) {
        
        let key_ref = this.item[i].key;
        
        this.firebase.removeItemFromListService(key_ref, course.campus);
        
        this.item.splice(i, 1);
        this.ngOnInit();
      }
    }
  }
}