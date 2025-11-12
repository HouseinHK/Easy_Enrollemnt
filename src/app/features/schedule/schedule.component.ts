import { Component } from '@angular/core';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { Router } from '@angular/router';
import { MContainerComponent } from "../../m-framework/components/m-container/m-container.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [MContainerComponent, CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent {
  slots_MW: {num: number, time: string}[] = this.firebase.slots_MW;
  slots_TR: {num: number, time: string}[] = this.firebase.slots_TR;

  selectedCampus: string = '';

  alAinSlots: number[] = [];
  abuDhabiSlots: number[] = [];

  constructor(private firebase: FirebaseService, private router: Router) {
    this.loadAvailableSlots();
  }

  async loadAvailableSlots() {
    try {
      const alAinDataPromise = this.firebase.getItemsService('Al Ain');
      const abuDhabiDataPromise = this.firebase.getItemsService('Abu Dhabi');

      const [alAinData, abuDhabiData] = await Promise.all([alAinDataPromise, abuDhabiDataPromise]);

      this.alAinSlots = alAinData ? alAinData.map(item => Number(item.val().time_slot)) : [];
      this.abuDhabiSlots = abuDhabiData ? abuDhabiData.map(item => Number(item.val().time_slot)) : [];

    } catch (error) {
      console.error('Error loading available slots:', error);
      this.alAinSlots = [];
      this.abuDhabiSlots = [];
    }
  }


  isSlotAvailable(slotNum: number): boolean {
    if (this.selectedCampus === 'Al Ain') {
      return this.alAinSlots.includes(slotNum);
    } else if (this.selectedCampus === 'Abu Dhabi') {
      return this.abuDhabiSlots.includes(slotNum);
    }
    return false;
  }


  onSlotClick(slot: {num: number, time: string}) {
    if (this.isSlotAvailable(slot.num)) {
      this.firebase.clear();
      
      this.firebase.al_ain = (this.selectedCampus === 'Al Ain');
      this.firebase.abu_dhabi = (this.selectedCampus === 'Abu Dhabi');
      
      this.firebase.slot_button = slot.num;
      this.router.navigate(['/dashboard/more-info']);
    }
  }
}