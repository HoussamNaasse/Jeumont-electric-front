import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { InfosService } from '../services/infos.service';
import { TicketsService } from '../services/tickets.service';
import { CookieService } from 'ngx-cookie-service';
import { SharedTitleService } from '../services/shared-title.service';

@Component({
  selector: 'app-update-prma',
  templateUrl: './update-prma.component.html',
  styleUrls: ['./update-prma.component.scss']
})
export class UpdatePrmaComponent implements OnInit {  
  selectedFiles: File[] = [];
  attachements: any[] = [];
  files: any[] = [];
  allStatus: any[] = [];
  sides: any[] = [];
  pieces: any[] = [];
  asked: any;
  text: string  = 'Your ticket has been successfully modified.';
  isLoadingPage: boolean = true;
  isVisible: boolean = false;
  updateStatus: boolean = false;
  updatePiece: boolean = false;
  askedLogByAsked: any[] = [];
  askedUuid!: string | null;
  attachementToDelete: any;
  updateDescription: boolean = false;
  fileToDelete: any;
  isDeleteFileToDownloadTicketVisible: boolean = false;
  isDeleteFileTicketVisible: boolean = false;
  maxFileCount: number = 10;
  loading: boolean = false;
  equipementsinterne: any[] = [];

  // tables spare parts
  spare_parts_database: any[] = [];  
  spare_parts: any[] = [];

  // value spare
  piece_uuid: string = "";
  piece: any;
  quantity: number = 0;
  purchase_order_number!: string;
  expected_date!: Date;
  status_ifs!: string; 

  constructor(
    private router: Router,   
    private route: ActivatedRoute,
    private authService: AuthService,
    private infosService: InfosService, 
    private ticketsService: TicketsService,
    private cookieService: CookieService,
    private sharedTitleService: SharedTitleService,
  ) {}

  ngOnInit(): void {
    this.sharedTitleService.changeTitle("Update PRMA");
    this.route.paramMap.subscribe(params => {
      this.askedUuid = params.get('asked_uuid');
      if (this.askedUuid) {
        this.getAskedLogs(this.askedUuid);
        this.fetchAskedData();
        this.getAttachements();
        this.fetchPrmaeqpinternal();
      }
    });

    this.fetchPieces();
    this.fetchStatus();
    this.fetchSides();
    this.fetchEquipementInterne();

    setTimeout(() => {
      this.isLoadingPage = false;
    }, 2000);
  }

  private fetchSides(): void {
    this.infosService.getSides().subscribe(
      data => {
        this.sides = data;
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  fetchAskedData(): void {
    if (this.askedUuid !== null) {
      this.ticketsService.getOneAskedPRMAData(this.askedUuid).subscribe(
        data => {
          this.asked = data;
          this.sharedTitleService.changeTitle(this.asked.asked_ref);
        },
        error => {
          console.error('Error fetching asked details:', error);
        }
      );
    }
  }

  addToSpareParts() {
    this.infosService.findEquipementInterneById(this.piece_uuid).subscribe(
      data => {
        this.piece = data;

        this.spare_parts.push({
          'piece': this.piece,
          'quantity': this.quantity,
          'purchase_order_number': this.purchase_order_number,
          'expected_date': this.expected_date,
          'status_ifs': this.status_ifs
        })
    
        this.piece_uuid = ""
        this.piece= null;
        this.quantity= 0;
        this.purchase_order_number= "";
        this.expected_date= new Date();
        this.status_ifs= "";
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }
  
  private getAttachements() {
    if (this.askedUuid !== null) { 
      this.ticketsService.getAttachements(this.askedUuid).subscribe(
        data => {
          console.log(data, 'Data attachements');
          this.attachements = data;
        },
        error => {
          console.error('Erreur lors de la récupération des types d\'effet:', error);
        }
      );
    }
  }

  private getAskedLogs(id: string) {
    this.infosService.getLogAsked(id).subscribe(
      data => {
        console.log('asked log', data);
        this.askedLogByAsked = data;
      },
      error => {
        console.error('Erreur lors de la récupération des on calls:', error);
      }
    );
  }

  private fetchPieces() {
    this.infosService.getPieces().subscribe(
      data => {
        this.pieces = data;
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  private fetchPrmaeqpinternal () {
    this.ticketsService.findPRMAEqpInternals(this.askedUuid).subscribe(
      response => {
        this.spare_parts_database= response;
      },
      error => {
        console.error('Erreur:', error);
        this.loading = false;
      }
    );
  }

  private fetchStatus(): void {
    this.infosService.getStatuses().subscribe(
      data => {
        this.allStatus = data;
      },
      error => {
        console.error('Erreur lors de la récupération des types d\'effet:', error);
      }
    );
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  toggleDeleteFileToDownloadTicket(att: any) {
    this.fileToDelete = att;
    this.isDeleteFileToDownloadTicketVisible = !this.isDeleteFileToDownloadTicketVisible;
  }

  onFileChange(event: any) {
    this.selectedFiles = Array.from(event.target.files);
    const files = event.target.files;
    this.handleFiles(files);
  }

  handleFiles(files: File[]) {
    console.log(files);
    for (const file of files) {
      this.files.push({ name: file.name, size: this.formatFileSize(file.size) });
    }
  }

  formatFileSize(size: number): string {
    const megabytes = size / (1024 * 1024); 
    return megabytes.toFixed(2) + ' Mo';
  }

  isCustomerEnabled(): boolean {
    return this.authService.getUserRole() === 10 || this.authService.getUserRole() === 11 || this.authService.getUserRole() === 12;
  }

  isTechnicianEnabled(): boolean {
    return this.authService.getUserRole() === 2;
  }

  isManagerEnabled(): boolean {
    return this.authService.getUserRole() === 1;
  }

  toggleUpdateDescription() {
    this.updateDescription = !this.updateDescription;
  }

  submitForm() {
    this.loading = true;
    
    const user_uuid = this.cookieService.get('user_uuid');

    this.ticketsService.updateAskedPRMA(this.asked, this.asked.asked_uuid, user_uuid).subscribe(
      response => {
        this.openPopup();
      
        if (this.askedUuid) {
          const user_uuid = this.cookieService.get('user_uuid');
          this.uploadFile(this.askedUuid, user_uuid);
          
          this.spare_parts.forEach((spare_parts) =>{
            this.ticketsService.createAskedPRMAEqpInternal(this.askedUuid, spare_parts).subscribe(
              response => {
                console.log(response);  
              },
              error => {
                console.error('Erreur:', error);
                this.loading = false;
              }
            );
          });
        }

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 4000); 
      },
      error => {
        console.error('Error creating PRFS:', error);
        this.loading = false;
      }
    );
  }

  isPreviousElementTrue(elementName: string): boolean {
    switch (elementName) {
      case 'quote_sent_to_supplier':
        return this.asked.offer_received;
      case 'quote_received_from_supplier':
        return this.asked.quote_sent_to_supplier;
      case 'offre_sent':
        return this.asked.quote_received_from_supplier;
      case 'customer_response':
        return this.asked.offre_sent;
      case 'recovery_of_purchase_orders':
        return this.asked.customer_response;
      case 'creation_of_the_project':
        return this.asked.recovery_of_purchase_orders;
      case 'creation_of_the_purchase_request':
        return this.asked.creation_of_the_project;
      case 'release_of_purchase_requisition':
        return this.asked.creation_of_the_purchase_request;
      case 'creating_the_purchase_order':
        return this.asked.release_of_purchase_requisition;
      case 'material_reception':
        return this.asked.creating_the_purchase_order;
      case 'provisionning_jeumont':
        return this.asked.material_reception;
      case 'material_sent':
        return this.asked.provisionning_jeumont;
      case 'bill_sent':
        return this.asked.material_sent;
      default:
        return false;
    }
  }


  private fetchEquipementInterne() {
    this.infosService.getEquipementsinterne().subscribe(
      data => {
        this.equipementsinterne = data;
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  uploadFile(askedUuid: string, userUuid: string) {
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('files', this.selectedFiles[i]);
      }

      this.ticketsService.uploadFile(formData, askedUuid, userUuid, 2).subscribe(
        (response) => {
          console.log('Files uploaded successfully', response);
        },
        (error) => {
          console.error('File upload failed', error);
        }
      );
    }
  }
  
  openPopup() {
    this.isVisible = true;
  }
  
  getFileNameWithoutExtension(fileName: string): string {
    const lastIndex = fileName.lastIndexOf('.');
    
    if (lastIndex !== -1) {
      const baseName = fileName.slice(0, lastIndex);
      const generatedFileName = baseName.slice(0, 4).padEnd(4, '0');
      return generatedFileName;
    } else {
      return fileName.slice(0, 4).padEnd(4, '0');
    }
  }

  toggleStatus() {
    this.updateStatus = !this.updateStatus;
  }

  togglePiece() {
    this.updatePiece = !this.updatePiece;
  }

  getColorRGB(hexColor: string): string {
    const hex = hexColor.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return r + ',' + g + ',' + b;
  }
  
  downloadFile(filename: string) {
    const pathSegments = filename.split('/');

    const fileName = pathSegments[pathSegments.length - 1];

    this.ticketsService.downloadAttachement(fileName).subscribe(
      data => { 
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Erreur lors de la récupération des types d\'effet:', error);
      }
    );
  }

  toggleDeleteFileTicket(att: any) {
    this.attachementToDelete = att;
    this.isDeleteFileTicketVisible = !this.isDeleteFileTicketVisible;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  
    const droppedFiles = event.dataTransfer?.files;
  
    if (droppedFiles && droppedFiles.length > 0) {
      for (let i = 0; i < droppedFiles.length; i++) {
        if (this.files.length < this.maxFileCount) {
          const file = droppedFiles[i];
  
          const filePath = URL.createObjectURL(file);
  
          this.files.push({
            name: file.name,
            path: filePath
          });
        } else {
          alert("files has been truncated to 10 files.");
        }
      }
    }
  }

  deleteSparePartDatabase(ref: any) {
    this.ticketsService.deletePRMAEqpInternals(ref).subscribe(
      response => {
        this.fetchPrmaeqpinternal()
      },
      error => {
        console.error('Erreur:', error);
        this.loading = false;
      }
    );   
  }

  deleteSparePart(index: number): void {
    this.spare_parts.splice(index, 1);
  }

  deleteFiles(fileName: string) {
    const index = this.files.findIndex(file => file.name === fileName);
    if (index !== -1) {
      this.files.splice(index, 1);
      console.log(`File ${fileName} deleted`);
    } else {
      console.log(`File ${fileName} not found`);
    }
  }

  deleteFile(attachementId: string) {
    if ( this.askedUuid ) {
      this.ticketsService.removeAttachement(attachementId).subscribe(
        data => { 
          this.getAttachements();
        },
        error => {
          console.error('Erreur:', error);
        }
      );
    }
  }

  clickDeleteFile() {
    this.deleteFile(this.attachementToDelete.attachment_id);
    this.isDeleteFileTicketVisible = !this.isDeleteFileTicketVisible;
  }

  clickDeleteFileToDownload() {
    this.deleteFiles(this.fileToDelete.name);
    this.isDeleteFileToDownloadTicketVisible = !this.isDeleteFileToDownloadTicketVisible;
  }

  cancelDeleteFile () {
    this.attachementToDelete = null;
    this.isDeleteFileTicketVisible = !this.isDeleteFileTicketVisible;
  }

  cancelDeleteFileToDownload () {
    this.fileToDelete = null;
    this.isDeleteFileToDownloadTicketVisible = !this.isDeleteFileToDownloadTicketVisible;
  }

  cancel() {
    if (this.authService.getUserRole() === 10 || this.authService.getUserRole() === 11 || this.authService.getUserRole() === 12) {
      this.router.navigate(['/client']);
    } else {
      this.router.navigate(['/']);
    }
  }

}
