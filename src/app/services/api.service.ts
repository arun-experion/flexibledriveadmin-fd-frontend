import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LogService } from './log.service';
import { environment as env } from 'src/environments/environment';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const { baseUrl } = env;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private logServ: LogService
  ) { }

  get(url: string): Observable<any> {
    return this.http.get(`${baseUrl}${url}`, httpOptions).pipe(
      tap(res => this.logServ.success(`Data fetched from ${baseUrl}${url}`)),
      catchError(this.handleError())
    );
  }

  getNoBaseUrl(url: string): Observable<any> {
    return this.http.get(`${url}`, httpOptions).pipe(
      tap(res => this.logServ.success(`Data fetched from ${url}`)),
      catchError(this.handleError())
    );
  }

  getFile(url: string): Observable<any> {
    return this.http.get(`${baseUrl}${url}`, { responseType: 'blob', headers: { 'Content-Type': 'application/json' } }).pipe(
      tap(res => this.logServ.success(`Data fetched from ${baseUrl}${url}`)),
      catchError(this.handleError())
    );
  }

  /**
   *
   * @param url :- API request URL
   * @param payload :- Use as request body
   */
  post(url: string, payload: any): Observable<any> {
    return this.http.post<any>(`${baseUrl}${url}`, payload, httpOptions).pipe(
      tap(response => this.logServ.success(`Data fetched from ${baseUrl}${url}`)),
      catchError(this.handleError())
    );
  }

  put(url: string, payload: any): Observable<any> {
    return this.http.put<any>(`${baseUrl}${url}`, payload, httpOptions).pipe(
      tap(res => this.logServ.success(`Data Saved on ${baseUrl}${url}`)),
      catchError(this.handleError())
    )
  }

  delete(url: string): Observable<any> {
    return this.http.delete(`${baseUrl}${url}`, httpOptions).pipe(
      tap(res => this.logServ.success(`Data fetched from ${baseUrl}${url}`)),
      catchError(this.handleError())
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   */
  private handleError<T>() {
    return (error: any): Observable<T> => {

      this.logServ.error(`${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(error.error as T);
    };
  }

}
