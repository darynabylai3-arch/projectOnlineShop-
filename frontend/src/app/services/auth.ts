import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8000/api/auth';
  private http = inject(HttpClient);
  private router = inject(Router);

  login(username: string, password: string) {
    return this.http.post<{access: string, refresh: string}>(
      `${this.api}/token/`, { username, password }
    ).pipe(tap(tokens => {
      localStorage.setItem('access', tokens.access);
      localStorage.setItem('refresh', tokens.refresh);
    }));
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${this.api}/register/`, { username, email, password });
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access');
  }

  isAdmin(): boolean {
    const token = localStorage.getItem('access');
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.is_staff === true;
  }
}