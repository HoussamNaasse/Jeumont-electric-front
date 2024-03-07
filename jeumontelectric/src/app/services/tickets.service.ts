import { Constants } from '../utils/constants';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class TicketsService {
  private apiUrl = Constants.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const accessToken = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`
    });
  }

  getAskedDataSF(sort: string): Observable<any> {
    let params = new HttpParams()
      .set('sort', sort || '');
    return this.http.get(`${this.apiUrl}/asked`, { headers: this.getHeaders(), params });
  }

  getAskedPrmaList(description: string): Observable<any> {
    let params = new HttpParams()

    if (description) {
      params = params.set('asked_description', description);
    }

    return this.http.get(`${this.apiUrl}/asked/list/prma`, { headers: this.getHeaders(), params });
  }

  getAskedPrfmList(description: string): Observable<any> {
    let params = new HttpParams()

    if (description) {
      params = params.set('asked_description', description);
    }

    return this.http.get(`${this.apiUrl}/asked/list/prfm`, { headers: this.getHeaders(), params });
  }

  getAskedPrfsList(description: string): Observable<any> {
    let params = new HttpParams()

    if (description) {
      params = params.set('asked_description', description);
    }

    return this.http.get(`${this.apiUrl}/asked/list/prfs`, { headers: this.getHeaders(), params });
  }

  getAskedDataClient(page: number, description: string, sort: string, typeFilter: string, statusFilter: number, clientFilter: string, sortOption: string, itemSize: number): Observable<any> {
    let params = new HttpParams()
      .set('sort', sort || '')
      .set('item_size', itemSize || 40)
      .set('page', page || 1);

    if (description) {
      params = params.set('asked_description', description);
    }

    if (typeFilter) {
      params = params.set('typeFilter', typeFilter);
    }

    if (statusFilter) {
      params = params.set('statusFilter', statusFilter);
    }

    if (clientFilter) {
      params = params.set('clientFilter', clientFilter);
    }

    if (sortOption) {
      params = params.set('sortOption', sortOption);
    }

    return this.http.get(`${this.apiUrl}/asked/client`, { headers: this.getHeaders(), params });
  }

  getAskedData(page: number, description: string, sort: string, typeFilter: string, statusFilter: number, clientFilter: string, shipFilter: string, sortOption: string, itemSize: number): Observable<any> {
    let params = new HttpParams()
      .set('sort', sort || '')
      .set('item_size', itemSize || 40)
      .set('page', page || 1);

    if (description) {
      params = params.set('asked_description', description);
    }

    if (typeFilter) {
      params = params.set('typeFilter', typeFilter);
    }

    if (statusFilter) {
      params = params.set('statusFilter', statusFilter);
    }

    if (clientFilter) {
      params = params.set('clientFilter', clientFilter);
    }

    if (shipFilter) {
      params = params.set('shipFilter', shipFilter);
    }

    if (sortOption) {
      params = params.set('sortOption', sortOption);
    }

    return this.http.get(`${this.apiUrl}/asked`, { headers: this.getHeaders(), params });
  }

  getAskedDataStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/asked/statistics`, { headers: this.getHeaders()});
  }

  getAskedDataStatisticsClient(client: string,): Observable<any> {
    let params = new HttpParams()
      .set('client', client);

    return this.http.get(`${this.apiUrl}/asked/statistics/client`, { headers: this.getHeaders(), params});
  }

  getAskedDataChart(
    selectedDuration: number, 
    client: string, 
    user: string,
    ship: string,    
    skill: number,
    effect: number,
    side: number,
    tag: number,
    effectType: number,
    level: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('client', client)
      .set('user', user)
      .set('ship', ship)
      .set('selectedDuration', selectedDuration)
      .set('skill', skill)
      .set('effect', effect)
      .set('side', side)
      .set('tag', tag)
      .set('effectType', effectType)
      .set('level', level);

    return this.http.get(`${this.apiUrl}/asked/chart`, { headers: this.getHeaders(), params });
  }

  getAskedDataChartClient(selectedDuration: number, client: string, ship: string): Observable<any> {
    let params = new HttpParams()
      .set('client', client)
      .set('ship', ship)
      .set('selectedDuration', selectedDuration);

    return this.http.get(`${this.apiUrl}/asked/chart/client`, { headers: this.getHeaders(), params });
  }

  getOneAskedData(asked_uuid: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/asked/${asked_uuid}`, { headers: this.getHeaders() });
  }

  getOneAskedPRFSData(asked_uuid: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/prfs/${asked_uuid}`, { headers: this.getHeaders() });
  }

  getOneAskedPRMAData(asked_uuid: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/prma/${asked_uuid}`, { headers: this.getHeaders() });
  }

  getOneAskedPRFMData(asked_uuid: string) {
    return this.http.get(`${this.apiUrl}/prfm/${asked_uuid}`, { headers: this.getHeaders() });
  }

  getAskedPRFM(): Observable<any> {
    return this.http.get(`${this.apiUrl}/prfm`, { headers: this.getHeaders() });
  }

  getRelatedPrfs(asked_uuid: string): Observable<any>{
    return this.http.get(`${this.apiUrl}/prfm/related/${asked_uuid}`, { headers: this.getHeaders() });
  }

  getAskedPRFS(): Observable<any> {
    return this.http.get(`${this.apiUrl}/prfs`, { headers: this.getHeaders() });
  }

  createAskedPRMA(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prma`, data, { headers: this.getHeaders() });
  }

  findPRMAEqpInternals(asked_uuid: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/prmaeqpinternal/${asked_uuid}`, { headers: this.getHeaders() });
  }

  createAskedPRMAEqpInternal(asked_uuid: any, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prmaeqpinternal/${asked_uuid}`, data, { headers: this.getHeaders() });
  }

  deletePRMAEqpInternals(ref: any) {
    return this.http.delete(`${this.apiUrl}/prmaeqpinternal/${ref}`, { headers: this.getHeaders() });
  }

  createAskedPRFS(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prfs`, data, { headers: this.getHeaders() });
  }

  createAskedPRFM(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prfm`, data, { headers: this.getHeaders() });
  }

  createAskedUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/askedusersincharge`, data, { headers: this.getHeaders() });
  }

  updateAskedPRFS(data: any, asked_uuid: string, user_uuid: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/prfs/update/prfs/${asked_uuid}/${user_uuid}`, data, { headers: this.getHeaders() });
  }

  updateAskedPRMA(data: any, asked_uuid: any, user_uuid: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/prma/${asked_uuid}/${user_uuid}`, data, { headers: this.getHeaders() });
  }

  updateAskedPRFM(data: any, asked_uuid: any, user_uuid: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/prfm/${asked_uuid}/${user_uuid}`, data, { headers: this.getHeaders() });
  }

  askedAddTag(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/askedTag`,  data ,{ headers: this.getHeaders() });
  }

  askedDeleteTag(tag_id: number, asked_uuid: string, user_uuid: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/askedTag/${asked_uuid}/${tag_id}/${user_uuid}` ,{ headers: this.getHeaders() });
  }

  related(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prfm/related`,  data ,{ headers: this.getHeaders() });
  }

  askedAddEvent(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/askedEffect`,  data ,{ headers: this.getHeaders() });
  }

  askedDeleteEvent(effect_id: number, asked_uuid: string, user_uuid: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/askedEffect/${asked_uuid}/${effect_id}/${user_uuid}` ,{ headers: this.getHeaders() });
  }

  uploadFile(formData: FormData, askedUuid: string, userUuid: string, cat: number) {
    return this.http.post(`${this.apiUrl}/prfs/upload/${askedUuid}/${userUuid}/${cat}`, formData, { headers: this.getHeaders() });
  }

  getAttachements(askedUuid: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/prfs/attachement/${askedUuid}` ,{ headers: this.getHeaders() });
  }

  downloadAttachement(filename: string): Observable<Blob>  {
    return this.http.get(`${this.apiUrl}/prfs/attachement/files/${filename}` , {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  removeAttachement(attId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/prfs/attachement/${attId}` ,{ headers: this.getHeaders() });
  }

  deletePrfsRelatedToPrfm(data: any) {
    return this.http.delete(`${this.apiUrl}/prfm/related/${data.asked_prfs_uuid}/${data.asked_prfm_uuid}`,{ headers: this.getHeaders() });
  }
}
