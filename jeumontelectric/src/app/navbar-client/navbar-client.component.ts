import { Component, OnInit } from '@angular/core';
import { SharedTitleService } from '../services/shared-title.service';

@Component({
  selector: 'app-navbar-client',
  templateUrl: './navbar-client.component.html',
  styleUrls: ['./navbar-client.component.scss']
})
export class NavbarClientComponent implements OnInit {
      
  isMenuVisible = false;
  isModalVisible = false;
  menuImgSrc: string = 'assets/icons/menu.png';
  title!: string;
  isCreationTicketVisible: boolean = false;  

  constructor(
    private sharedTitleService: SharedTitleService,
  ) {}
  
  ngOnInit(): void {
    this.sharedTitleService.currentTitle.subscribe((newTitle) => {
      this.title = newTitle;
    });
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
    this.menuImgSrc = this.isMenuVisible ? 'assets/icons/menu-close.png' : 'assets/icons/menu.png';
  }

  toggleCreationTicket() {
    this.isCreationTicketVisible = !this.isCreationTicketVisible;
  }

  createTicket() {
    this.toggleMenu();
    this.toggleCreationTicket();
  }

  toggleModal() {
    this.isModalVisible = !this.isModalVisible;
  }

  toggleModalAndMenu() {
    this.toggleModal();
    this.toggleMenu();
  }
}
