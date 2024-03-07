import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InfosService } from '../services/infos.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  feedbackForm!: FormGroup;
  currentRoute!: string;
  isLanguageOverlayVisible: boolean = false;
  isFeedbackVisible: boolean = false; 
  selectedFile!: File;
  isSaturday: boolean;

  constructor(    
    private fb: FormBuilder,
    private router: Router,   
    private infosService: InfosService,
    private authService: AuthService, 
    private translateService: TranslateService
  ) {
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });

    this.feedbackForm = this.fb.group({
      email: [''],
      subject: [''],
      description: ['']
    });
   
    const today = new Date().getDay();
    this.isSaturday = today === 6;
  }

  ngOnInit() {}

  toggleLangage() {
    this.isLanguageOverlayVisible = !this.isLanguageOverlayVisible;
  }

  rapportRedirect() {
    this.router.navigate(['/rapport']);
  }

  toggleFeedback() {
    this.isFeedbackVisible = !this.isFeedbackVisible;
  }

  shouldDisplayButtons(): boolean {
    const currentRoute = this.router.url;
    return !currentRoute.startsWith('/login');
  }

  shouldDisplayButtonsToAdmin(): boolean {
    const currentRoute = this.router.url;
    return currentRoute.startsWith('/client');
  }

  logout() { this.authService.logout() }

  redirect() {
    const userRole = this.authService.getUserRole();
  
    if (userRole === 1 || userRole === 2 || userRole === 3 || userRole === 4) {
      this.router.navigate(['/']);
    } else if (userRole === 10 || userRole === 11 || userRole === 12) {
      this.router.navigate(['/client']);
    }
  }

  changeLanguage(lang: string) {
    this.translateService.use(lang); 
    this.toggleLangage();
  }

  handleFileInput(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  onSubmit(): void {
    if (this.feedbackForm.valid) {
      const formData = new FormData();
  
      formData.append('email', this.feedbackForm.value['email']);
      formData.append('subject', this.feedbackForm.value['subject']);
      formData.append('description', this.feedbackForm.value['description']);
  
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }
  
      this.infosService.sendFeedback(formData).subscribe(
        response => {
          this.isFeedbackVisible = false;
          this.feedbackForm.reset();
        },
        error => {
          console.error('Error:', error);
        }
      );
    }
  }
}
