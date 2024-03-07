import { Component, Input } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-model-create',
  templateUrl: './model-create.component.html',
  styleUrls: ['./model-create.component.scss']
})
export class ModelCreateComponent {
  @Input() isCreateTicketVisible!: boolean;

  constructor(
    private sharedService: SharedService,
    private router: Router
  ) {}

  toggleCreateTicket() {
    this.sharedService.setCreateTicketVisibility(!this.isCreateTicketVisible);
  }

  navigatePrfs() {
    this.router.navigate(['/create/prfs']);
    this.toggleCreateTicket();
  }

  navigatePrfm() {
    this.router.navigate(['/create/prfm']);
    this.toggleCreateTicket();
  }

  navigatePrma() {
    this.router.navigate(['/create/prma']);
    this.toggleCreateTicket();
  } 
  
}
