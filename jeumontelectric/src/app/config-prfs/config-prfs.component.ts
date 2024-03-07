import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../services/tickets.service';
import { FormControl, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-config-prfs',
  templateUrl: './config-prfs.component.html',
  styleUrls: ['./config-prfs.component.scss']
})
export class ConfigPrfsComponent implements OnInit {
  asked: any;
  tickets: any[] = [];
  isLoading: boolean = true;
  searchDescription: string = '';
  askedRefControl = new FormControl('', [Validators.maxLength(10)]);

  constructor (
    private cookieService: CookieService,
    private ticketsService: TicketsService
  ) {}

  setAsked(ticket: any) {
    this.asked = ticket;
    console.log(this.asked);
  }


  ngOnInit() {
    this.fetchTickets();
    this.asked= "select";
  }

  onSearchChange() {
    this.isLoading = true;
    this.fetchTickets();
  }

  fetchTickets() {
    this.ticketsService.getAskedPrfsList(this.searchDescription).subscribe(
      (data) => {
        this.tickets = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    );
  }

  submit() {
    const user_uuid = this.cookieService.get('user_uuid');
    this.ticketsService.updateAskedPRFS(this.asked, this.asked.asked_uuid, user_uuid).subscribe(
      response => {
        this.ngOnInit();
        this.onSearchChange();
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  cancel() {
    this.asked = null;
  }

}
