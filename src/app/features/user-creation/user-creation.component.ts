import { Component } from '@angular/core';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MFormUlaComponent } from '../../m-framework/components/m-form-ula/m-form-ula.component';

@Component({
  selector: 'app-user-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-creation.component.html',
  styleUrl: './user-creation.component.css'
})
export class UserCreationComponent {
  id: string = '';
  password: string = '';
  campus: string = '';
  message: string = '';
  isCreating: boolean = false;
  userType: string = '';
  userTypes: string[] = ['Student', 'Admin']
  campuses: string[] = ['Al Ain', 'Abu Dhabi'];

  constructor(private firebase: FirebaseService, private router: Router) {}



  async create_user() {
    if (!this.id || !this.password) {
      this.message = 'Please enter both ID and password';
      return;
    }

    this.isCreating = true;
    this.message = 'Creating user...';
    
    try {
      const success = await this.firebase.registerUser(this.id, this.password, this.campus, this.userType);
      
      if (success) {
        this.message = 'User created successfully!';
        this.id = '';
        this.password = '';
      } else {
        this.message = 'Failed to create user. ID might already exist.';
      }
    } catch (error) {
      console.error('Error creating user:', error);
      this.message = 'An error occurred while creating the user.';
    } finally {
      this.isCreating = false;
      setTimeout(() => {
          this.message = '';
        }, 4000); 

    }
  }
}

