import { Component } from '@angular/core';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { MFormUlaComponent } from '../../m-framework/components/m-form-ula/m-form-ula.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MContainerComponent, MFormUlaComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  id: string = '';
  password: string = '';
  loginError: string = '';
  type: string = '';
  isAdmin: boolean = false;

  constructor(private firebase: FirebaseService, private router: Router) {}

  async loginStudent() {
    this.loginError = ''; 
    
    try {
      const loginSuccess = await this.firebase.login(this.id, this.password);
      
      if (loginSuccess) {
        await this.checkUserRole();
        if (this.isAdmin) {this.router.navigate(['/dashboard/schedule']);}
        else {this.router.navigate(['/dashboard/view']);}
        
      } else {
        this.loginError = 'Invalid ID or password';
      }
    } catch (error) {
      console.error('Login error:', error);
      this.loginError = 'An error occurred during login. Please try again.';
    }
  }

  async checkUserRole() {
    const currentUser = this.firebase.getCurrentUser();
    try {
      const userData = await this.firebase.getItemService(`users/${currentUser}`);
      this.isAdmin = (userData.user === 'admin');
      console.log(userData)
    } catch (error: any) {
      console.error('Error getting user role:', error);
    }
  }
}
