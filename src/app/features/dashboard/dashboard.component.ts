import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FirebaseService } from '../../m-framework/services/firebase.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  isAdmin: boolean = false;
  isMobileMenuOpen: boolean = false;
  isMobileView: boolean = false;
  
  constructor(private router: Router, private firebase: FirebaseService) {
    this.checkScreenSize();
  }

  logout() {
    this.router.navigate(['']);
  }

  async ngOnInit() {
    await this.checkUserRole();
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobileView = window.innerWidth < 768;
    if (!this.isMobileView) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Prevent scrolling when menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
    }
  }

  closeMobileMenuIfOpen() {
    if (this.isMobileView) {
      this.closeMobileMenu();
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
