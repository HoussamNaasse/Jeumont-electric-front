import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../services/tickets.service';
import { SharedTitleService } from '../services/shared-title.service';
import { InfosService } from '../services/infos.service';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  currentPage: number = 1;
  isLoading = true;
  tickets: any[] = [];
  sortOption: string = '';
  showFilter = false;
  showExport = false;
  customers: any[] = [];
  status: any[] = [];
  client: string = '';
  searchDescription: string = ''; 
  selectedOptionSort: string = 'asc';
  count: number = 0;
  typeFilter: string = '';
  statusFilter: number = 0;
  exportType: string = '';
  pageSize: number = 20; 
  
  constructor(
    private ticketsService: TicketsService,
    private sharedTitleService: SharedTitleService,
    private cookieService: CookieService,
    private infosService: InfosService,
  ) {}

  ngOnInit() {
    this.client = this.cookieService.get('user_uuid');
    this.fetchTickets();
    this.sharedTitleService.changeTitle('ONBOARDING');
    this.fetchStatus();
  }

  resetFilter() {
    this.isLoading = true;
    this.statusFilter= 0;
    this.typeFilter = '';
    this.fetchTickets();
    this.toggleFilter();
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

  applyTypeFilter(type: string) {
    this.typeFilter = type;
    this.isLoading = true;
    this.fetchTickets();
    this.toggleFilter();
    }

  applyStatusFilter(statusFilter: number) {
    this.statusFilter = statusFilter;
    this.isLoading = true;
    this.fetchTickets();
    this.toggleFilter();
  }

  sort(name: string) {
    this.sortOption = name;
    this.isLoading = true;
    this.currentPage = 1;
    this.tickets = [];
    this.fetchTickets();
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
    this.showExport = false;
  }

  toggleExport() {
    this.showExport = !this.showExport;
    this.showFilter = false;
  }

  fetchTickets() {
    this.ticketsService.getAskedDataClient(this.currentPage, this.searchDescription, this.sortOption, this.typeFilter, this.statusFilter, this.client, this.selectedOptionSort, this.pageSize).subscribe(
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
  
  exportTypeSet(format: string) {
    this.exportType = format;
  }

  loadMoreData() {
    this.currentPage++;
    this.isLoading = true;
    this.fetchTickets();
  }

  exportData() {
    if (this.exportType === 'csv') {
      this.exportToCsv();
    } else if (this.exportType === 'json') {
      this.exportToJson();
    } else if (this.exportType === 'xls') {
      this.exportToXls();
    } else if (this.exportType === 'pdf') {
      this.exportToPDF();
    }
  }

  private exportToCsv() {
    const csvData = this.convertToCsv(this.tickets);

    const blob = new Blob([csvData], { type: 'text/csv' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private exportToJson() {
    const jsonData = JSON.stringify(this.tickets, null, 2);

    const blob = new Blob([jsonData], { type: 'application/json' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCsv(data: any[]): string {
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    return `${header}\n${rows.join('\n')}`;
  }  

  private exportToXls() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tickets);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
    XLSX.writeFile(wb, 'tickets.xlsx');
  }

  private exportToPDF() {
    const doc = new jsPDF.jsPDF({
      orientation: 'portrait',  
      unit: 'mm',              
      format: 'a4',            
    });
  
    let yPosition = 10; 
    const pageHeight = doc.internal.pageSize.height;
  
    this.tickets.forEach((ticket, index) => {
      const ticketData = `Ticket ${ticket.asked_ref}: ${ticket.asked_created_date}\nDescription: ${ticket.asked_description}`;
      const textLines = doc.splitTextToSize(ticketData, 180); 
      
      if (yPosition + doc.getTextDimensions(textLines).h > pageHeight - 10) {
        doc.addPage();
        yPosition = 10; 
      }
  
      doc.text(textLines, 10, yPosition);
      yPosition += doc.getTextDimensions(textLines).h + 10; 
    });
  
    doc.save('tickets.pdf');
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
