import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthInterceptorService implements HttpInterceptor {

  constructor() { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    try {
      const { token } = JSON.parse(localStorage.getItem('currentUser'));

      const cloned = request.clone({
        headers: request.headers.append('Authorization', `Bearer ${token}`)
      });

      return next.handle(cloned);
    } catch (error) {
      return next.handle(request);
    }
  }
}
