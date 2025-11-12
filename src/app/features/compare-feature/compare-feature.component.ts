import { Component } from '@angular/core';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { verifyHostBindings } from '@angular/compiler';

@Component({
  selector: 'app-compare-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compare-feature.component.html',
  styleUrl: './compare-feature.component.css'
})
export class CompareFeatureComponent {
  comparsion: any[];
  selected_items: any[];
  selected_key_items: any[];
  changes1: string[];
  changes2: string[];
  changes3: string[];
  name: string;
  previousVersion: any;
  comparing_done: boolean;

  constructor(private firebase: FirebaseService, private route: Router)
  {
    this.comparsion = [];
    this.selected_items = [];
    this.selected_key_items = [];
    this.changes1 = [];
    this.changes2 = [];
    this.changes3 = [];
    this.name = "";
    this.previousVersion = null;
    this.comparing_done = false;
  }

  async Save_version()
  {
    const al_ain = await this.firebase.getItemsService("Al Ain");
    const abu_dhabi = await this.firebase.getItemsService("Abu Dhabi");
    
    const cleanAlAin = [];
    for (let item of al_ain) {
      cleanAlAin.push(item.val());
    }
    
    const cleanAbuDhabi = [];
    for (let item of abu_dhabi) {
      cleanAbuDhabi.push(item.val());
    }
    
    const saveData = {
      name: this.name,
      al_ain: cleanAlAin,
      abu_dhabi: cleanAbuDhabi
    };
    
    this.previousVersion = saveData;
    
    await this.firebase.addItemService("Saved Versions", saveData);
    this.name = "";
    await this.loadVersions();
  }

  async ngOnInit()
  {
     if (!this.firebase.isLoggedIn()) {
      this.route.navigate(['']);
      return;
    }
    await this.loadVersions();
  }

  selectVersion(version: any)
  {
    if (this.selected_items.length < 2)
    {
      this.selected_items.push(version.val());
      this.selected_key_items.push(version.key);
    }
  }

  clearSelection()
  {
    this.selected_items = [];
    this.changes1 = [];
    this.changes2 = [];
    this.changes3 = [];
    this.comparing_done = false;
  }

  comparing()
  {
    this.changes1 = [];
    this.changes2 = [];
    this.changes3 = [];
    this.comparing_done = false;
    
    const version1Data = [];
    if (Array.isArray(this.selected_items[0].al_ain)) {
      for (let course of this.selected_items[0].al_ain) {
        version1Data.push(course);
      }
    }
    if (Array.isArray(this.selected_items[0].abu_dhabi)) {
      for (let course of this.selected_items[0].abu_dhabi) {
        version1Data.push(course);
      }
    }
    
    const version2Data = [];
    if (Array.isArray(this.selected_items[1].al_ain)) {
      for (let course of this.selected_items[1].al_ain) {
        version2Data.push(course);
      }
    }
    if (Array.isArray(this.selected_items[1].abu_dhabi)) {
      for (let course of this.selected_items[1].abu_dhabi) {
        version2Data.push(course);
      }
    }
    
    for (let i = 0; i < version1Data.length; i++)
    {
      const first_item = version1Data[i];
      let found = false;
      
      for (let j = 0; j < version2Data.length; j++)
      {
        const second_item = version2Data[j];
        
        if (first_item.course_code == second_item.course_code && 
            first_item.section_number == second_item.section_number &&
            first_item.campus == second_item.campus)
        {
          found = true;
          
          if (first_item.time_slot != second_item.time_slot)
          {
            this.changes1.push(`${first_item.course_code} moved from Slot ${first_item.time_slot} to Slot ${second_item.time_slot}`);
          }
          
          if (first_item.instructor != second_item.instructor)
          {
            this.changes2.push(`${first_item.course_code} reassigned from ${first_item.instructor} to ${second_item.instructor}`);
          }
          break; 
        }
      }
      
      if (!found)
      {
        this.changes3.push(`${first_item.course_code} in ${first_item.campus} was removed`);
      }
    }
    
    for (let i = 0; i < version2Data.length; i++)
    {
      const second_item = version2Data[i];
      let found = false;
      
      for (let j = 0; j < version1Data.length; j++)
      {
        const first_item = version1Data[j];
        
        if (second_item.course_code == first_item.course_code && 
            second_item.section_number == first_item.section_number &&
            second_item.campus == first_item.campus)
        {
          found = true;
          break;
        }
      }
      
      if (!found)
      {
        this.changes3.push(`${second_item.course_code} in ${second_item.campus} was added`);
      }
    }
    
    this.comparing_done = true;
  }

  async load()
  {
    if (this.selected_items.length === 1)
    {
      const selectedVersion = this.selected_items[0];
      this.selected_items.splice(0, 1);
      
      this.firebase.clearAllItemsService("Al Ain");
      this.firebase.clearAllItemsService("Abu Dhabi");

      for (let course of selectedVersion.al_ain) {
        this.firebase.addItemService("Al Ain", course);
      }
      for (let course of selectedVersion.abu_dhabi) {
        this.firebase.addItemService("Abu Dhabi", course);
      }
    }
  }

    async loadPrevious()
  {
    if (this.previousVersion)
    {
      this.firebase.addItemService("Saved Versions", this.previousVersion);
      this.ngOnInit();
    }
  }

  async selectedDelete()
  {
    if (this.selected_items.length === 1)
    {
      const selectedKey = this.selected_key_items[0];
      await this.firebase.removeItemFromListService(selectedKey, "Saved Versions");
      this.selected_items = [];
      this.selected_key_items = [];
      await this.loadVersions();
    }
  }

  async loadVersions() {
    this.comparsion = [];
    const saved_versions = await this.firebase.getItemsService("Saved Versions");
    for (let i = 0; i < saved_versions.length; i++) {
      this.comparsion.push(saved_versions[i]);
    }
    
    if (this.comparsion.length > 0) {
      this.previousVersion = this.comparsion[this.comparsion.length - 1].val();
    }
  }

  async deletePrevious()
  {
    if (this.comparsion.length > 0)
    {
      const lastVersion = this.comparsion[this.comparsion.length - 1];
      await this.firebase.removeItemFromListService(lastVersion.key, "Saved Versions");
      await this.loadVersions();
    }
  }

  isVersionSelected(version: any): boolean {
    if (this.selected_items.length === 0) return false;
    
    const versionName = version.val().name;
    return this.selected_items.some(item => item.name === versionName);
  }
}