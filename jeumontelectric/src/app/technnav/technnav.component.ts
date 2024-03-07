import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../services/tickets.service';
import { SharedTitleService } from '../services/shared-title.service';
import { InfosService } from '../services/infos.service';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import { SharedService } from '../services/shared.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-technnav',
  templateUrl: './technnav.component.html',
  styleUrls: ['./technnav.component.scss']
})
export class TechnnavComponent implements OnInit {
  currentPage: number = 1;
  isCreateTicketVisible$ = this.sharedService.isCreateTicketVisible$;
  isLoading = true;
  tickets: any[] = [];
  sortOption: string = '';
  showFilter = false;
  showExport = false;
  customers: any[] = [];
  status: any[] = [];
  client: string = '';
  ship: string = '';
  searchDescription: string = ''; 
  selectedOptionSort: string = 'asc';
  count: number = 0;
  pageSize: number = 30;
  typeFilter: string = '';
  statusFilter: number = 0;
  exportType: string = '';

  constructor(
    private ticketsService: TicketsService,
    private sharedTitleService: SharedTitleService,
    private infosService: InfosService,
    private sharedService: SharedService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.fetchTickets();
    this.sharedTitleService.changeTitle('ONBOARDING');
    this.fetchCustomers();
    this.fetchStatus();
  }

  isSalesSupportDisabled(): boolean {
    return this.authService.getUserRole() === 3
  }

  resetFilter() {
    this.isLoading = true;
    this.client= '';
    this.statusFilter= 0;
    this.typeFilter = '';
    this.fetchTickets();
  }

  fetchStatus() {
    this.infosService.getStatuses().subscribe(
      data => {
        this.status = data;
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  toggleCreateTicket() {
    const currentVisibility = this.sharedService.getIsCreateTicketVisible();
    this.sharedService.setCreateTicketVisibility(!currentVisibility);
  }

  private fetchCustomers(): void {
    this.infosService.getCustomers().subscribe(
      data => {
        this.customers = data;
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  applyTypeFilter(type: string) {
    this.typeFilter = type;
    this.isLoading = true;
    this.fetchTickets();
  }

  applyStatusFilter(statusFilter: number) {
    this.statusFilter = statusFilter;
    this.isLoading = true;
    this.fetchTickets();
  }

  applyClientFilter(client: string) {
    this.client = client;
    this.isLoading = true;
    this.fetchTickets();
  }

  sort(name: string) {
    this.sortOption = name;
    this.isLoading = true;
    this.currentPage = 1;
    this.tickets = [];
    this.fetchTickets();
  }

  fetchTickets() {
    this.ticketsService.getAskedData(this.currentPage, this.searchDescription, this.sortOption, this.typeFilter, this.statusFilter, this.client, this.ship, this.selectedOptionSort, this.pageSize).subscribe(
      (data) => {
        this.tickets = data.askedsList;
        this.count = data.count;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        alert(error.error.message);
        console.error('Erreur:', error);
      }
    );
  }

  search() {
    this.isLoading = true;
    this.fetchTickets();
  }

  onSortOptionChange() {
    this.isLoading = true;
    this.fetchTickets();
  }

  get totalPages() {
    return Math.ceil(this.count / this.pageSize);
  }

  changePage(offset: number): void {
    this.isLoading = true;
    this.currentPage += offset;
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.fetchTickets();
  }
}
