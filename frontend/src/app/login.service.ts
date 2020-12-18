import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  submitLoginDetails(formBody): Observable<any> {
    return this.http.post<any>('http://localhost:3000/authentication', formBody).pipe(
      tap((result: any) => console.log(`submitted login details for authentication`)),
      catchError(this.handleError<any>())
    )
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error)
      return of(result as T)
    }
  }
}
