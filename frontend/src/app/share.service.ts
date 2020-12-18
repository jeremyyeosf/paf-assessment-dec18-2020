import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor(private http: HttpClient) { }

  share(formBody): Observable<any> {
    return this.http.post<any>('http://localhost:3000/share', formBody).pipe(
      tap((result: any) => console.log(`sharing... (Ng call Express)`)),
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
