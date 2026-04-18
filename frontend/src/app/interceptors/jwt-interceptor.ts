import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access');

  // Не добавляем токен к публичным эндпоинтам
  const publicUrls = ['/api/products/'];
  const isPublic = publicUrls.some(url => req.url.includes(url));

  if (token && !isPublic) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        inject(Router).navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};