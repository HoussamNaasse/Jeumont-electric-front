import { Component, OnInit, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { extend } from '@syncfusion/ej2-base';
import { ScheduleComponent, GroupModel } from '@syncfusion/ej2-angular-schedule';
import { OnCallService } from '../services/on-call.service';
import { UsersService } from '../services/users.service';
import { InfosService } from '../services/infos.service';
import { getISOWeek } from 'date-fns';

@Component({
  selector: 'app-schedule-test',
  templateUrl: './schedule-test.component.html',
  styleUrls: ['./schedule-test.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ScheduleTestComponent implements OnInit {
  @ViewChild('scheduleObj') public scheduleObj: ScheduleComponent | undefined;
  @Input() addToBackUp: any[] = [];
  @Input() addToEvents: Record<string, any>[] = [];
  public data: Record<string, any>[] = [];
  public selectedDate: Date = new Date();
  public employeeDataSource: Record<string, any>[] = [];
  public nextId = 1;
  weeks: any[] = [];
  years: any[] = [];
  idWeek: number = 0;
  idYear: number = 0;
  userId: string = '';
  primary_backup: boolean = false;
  emergency_backup: boolean = false;  
  isAddEventVisible: boolean = false;
  isUpdateEventVisible: boolean = false;
  currentDate: Date = new Date();
  currentWeek: number = getISOWeek(this.currentDate);
  currentYear: number = this.currentDate.getFullYear();

  constructor(
    private infosService: InfosService, 
    private onCallService: OnCallService,
  ) {}

  ngOnInit() {
    this.updateData();
    this.fetchWeeks();
    this.fetchYears();
  }
  
  fetchWeeks() {
    this.infosService.getWeeks().subscribe(
      data => {
        this.weeks = data;
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  fetchYears() {
    this.infosService.getYears().subscribe(
      data => {
        this.years = data;
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  private updateData() {
    this.employeeDataSource = this.addToBackUp;
    this.data = extend([], this.addToEvents, undefined, true) as Record<string, any>[];
    this.eventSettings = { dataSource: this.data };
  }

  toggleAddEvent () {
    this.isAddEventVisible = !this.isAddEventVisible;
  }

  toggleUpdateEvent () {
    this.isUpdateEventVisible = !this.isUpdateEventVisible;
  }

  

  onAddToPlanning() {

    if ( this.primary_backup && this.emergency_backup ) {
      alert ('Select primary or emergency');
    } else if ( !this.primary_backup && !this.emergency_backup ) {
      alert ('Select primary or emergency');
    }

    const data = {
      user_uuid: this.userId,  
      week_id: this.idWeek,
      year_id: this.idYear, 
      primary_backup: this.primary_backup,
      emergency_backup: this.emergency_backup
    }

    this.onCallService.createOnCall(data).subscribe(
      response => {
        console.log('Successfully:', response);
        
        this.getAddEventSche(response);

        this.idWeek = 0;
        this.idYear = 0;
        this.userId = '';
        this.primary_backup = false;
        this.emergency_backup = false;

        this.toggleAddEvent();
      },
      error => {
        console.error('Erreur:', error);
      }
    )
  }

  

  getAddEventSche(response: any) {
    const startDate = this.getStartDateOfWeek(response.year_id, response.week_id);
    const endDate = this.getEndDateOfWeek(response.year_id, response.week_id);

    console.log(startDate);
    console.log(endDate);

    const newEvent = {
      EmployeeId: response.user_uuid,
      Subject: response.primary_backup ? `${response.reason} : Primary`: `${response.reason} : Emergency`,
      StartTime: new Date(startDate), 
      EndTime: new Date(endDate),
    };

    console.log(newEvent);

    this.eventSettings.dataSource.push(newEvent);
    
    this.scheduleObj?.refresh();
  }


  getFetchData () {
    this.onCallService.findOnCalls().subscribe(
      data => {
        data.forEach((event: any) => {
          if ( event.primary_backup ) {
            this.getAddEvent(event.year_id, event.week_id, `${event.reason} : Primary`, event.user_uuid);
          } else if ( event.emergency_backup ) {
            this.getAddEvent(event.year_id, event.week_id, `${event.reason} : Emergency`, event.user_uuid);
          }
        })
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  getAddEvent(year: number, weekNumber: number, text: string,  user_id: string) {
    const startDate = this.getStartDateOfWeek(year, weekNumber);
    const endDate = this.getEndDateOfWeek(year, weekNumber);

    this.addToEvents.push({ Id: this.nextId, Subject: text, StartTime: new Date(startDate), EndTime: new Date(endDate), EmployeeId: user_id });
    this.nextId++;
  }

  private getStartDateOfWeek(year: number, weekNumber: number): Date {
    const januaryFirst = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const startOfWeek = new Date(januaryFirst);

    startOfWeek.setDate(januaryFirst.getDate() + (7 - januaryFirst.getDay()) + daysOffset);
    return startOfWeek;
  }

  private getEndDateOfWeek(year: number, weekNumber: number): Date {
    const startDate = this.getStartDateOfWeek(year, weekNumber);
    const endDate = new Date(startDate);

    endDate.setDate(startDate.getDate() + 6);
    return endDate;
  }

  public allowInline = true;
  public group: GroupModel = { 
    resources: ['Employee'], 
    allowGroupEdit: true
  };
  public allowMultiple = false;
  public eventSettings: any;

  public getEmployeeName(value: any): string {
    const details = value;
    if (details.resource && details.resource.textField !== undefined) {
      return details.resourceData[details.resource.textField] as string;
    }
    return '';
  }

  public getEmployeeDesignation(value: any): string {
    const details = value;
    if (details.resource && details.resource.textField !== undefined) {
      const resourceName: string = details.resourceData[details.resource.textField] as string;
      return details.resourceData['Designation'] as string;
    }
    return ''; 
  }

  public getEmployeeImageName(value: any): string {
    return this.getEmployeeName(value).toLowerCase();
  }

  addNewEvent() {
    const newEvent = {
      EmployeeId: 'fa4a5716-6e0d-4a68-9908-1ea499569fab',
      Subject: 'Nouvel événement',
      StartTime: new Date(),
      EndTime: new Date(new Date().getTime() + (60 * 60 * 1000))
    };

    this.eventSettings.dataSource.push(newEvent);

    this.scheduleObj?.refresh();
  }
}