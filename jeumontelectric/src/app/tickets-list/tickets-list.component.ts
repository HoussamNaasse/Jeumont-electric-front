import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../services/tickets.service';
import { SharedTitleService } from '../services/shared-title.service';
import { InfosService } from '../services/infos.service';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss']
})
export class TicketsListComponent implements OnInit {
  isfilter: boolean = false;
  currentPage: number = 1;
  isLoading = true;
  tickets: any[] = [];
  askedDescription: string = '';
  count: number = 0;
  sortOption: string = '';
  selectedOption: string | null = null;
  showFilter = false;
  showExport = false;
  customers: any[] = [];
  status: any[] = [];
  client: string = '';
  ships: any[] = [];
  ship: string = '';
  searchDescription: string = '';
  pageSize: number = 40;
  typeFilter: string = '';
  statusFilter: number = 0;
  exportType: string = '';
  selectedOptionSort: string = 'asc';

  constructor(
    private ticketsService: TicketsService,
    private sharedTitleService: SharedTitleService,
    private infosService: InfosService,
  ) {}

  ngOnInit() {
    this.sharedTitleService.changeTitle('listingTickets');
    this.fetchTickets();
    this.fetchCustomers();
    this.fetchStatus();
    this.fetchShips();
  }

  private fetchShips(): void {
    if (this.client) {
      this.infosService.getShipsByCustomer(this.client).subscribe(
        data => {
          this.ships = data;
        },
        error => {
          console.error('Erreur:', error);
        }
      );
    } else {
      this.infosService.getShips().subscribe(
        data => {
          this.ships = data;
        },
        error => {
          console.error('Erreur:', error);
        }
      );
    }
  }

  resetFilter() {
    this.isfilter = false;
    this.isLoading = true;
    this.client= '';
    this.ship='';
    this.statusFilter= 0;
    this.typeFilter = '';
    this.fetchTickets();
    this.toggleFilter();
  }
   goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.fetchTickets();
    }
  }

  getPageNumbers(currentPage: number, totalPages: number): any[] {
    const pageNumbers = [];
    const maxDisplayedPages = 5;

    if (totalPages <= maxDisplayedPages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftOffset = Math.floor(maxDisplayedPages / 2);
      let start = currentPage - leftOffset;
      let end = currentPage + leftOffset;

      if (start <= 0) {
        start = 1;
        end = maxDisplayedPages;
      }

      if (end > totalPages) {
        end = totalPages;
        start = end - maxDisplayedPages + 1;
      }

      if (start > 1) {
        pageNumbers.push(1);
        if (start > 2) {
          pageNumbers.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
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
    this.isfilter = true;
    this.typeFilter = type;
    this.isLoading = true;
    this.fetchTickets();
    this.toggleFilter();
    }

  applyStatusFilter(status: number) {
    this.isfilter = true;
    this.statusFilter = status;
    this.isLoading = true;
    this.fetchTickets();
    this.toggleFilter();
  }

  applyClientFilter(client: string) {
    this.isfilter = true;
    this.client = client;
    this.isLoading = true;
    this.fetchShips();
    this.fetchTickets();
    this.toggleFilter();
  }

  applyShipFilter(ship: string) {
    this.isfilter = true;
    this.ship = ship;
    this.isLoading = true;
    this.fetchTickets();
    this.toggleFilter();
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

  fetchTickets() {
    this.ticketsService.getAskedData(this.currentPage, this.searchDescription ,this.sortOption, this.typeFilter, this.statusFilter, this.client, this.ship, this.selectedOptionSort, this.pageSize).subscribe(
      (data) => {
        console.log(data);
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

  sort(name: string) {
    this.currentPage = 1;
    this.selectedOption = name;
    this.sortOption = name;
    this.isLoading= true ;
    this.tickets = [];
    this.fetchTickets();
  }

  get totalPages() {
    return Math.ceil(this.count / this.pageSize);
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
    this.showExport = false;
  }

  toggleExport() {
    this.showExport = !this.showExport;
    this.showFilter = false;
  }

  exportTypeSet(format: string) {
    this.exportType = format;
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
    } else {
      alert ('chose type export');
    }
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

  search() {
    this.isLoading = true;
    this.fetchTickets();
  }
}
