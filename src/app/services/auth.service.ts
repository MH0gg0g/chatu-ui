import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginRes { token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private _current = new BehaviorSubject<string | null>(null);
  public current$ = this._current.asObservable();

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post<LoginRes>(`${this.baseUrl}/login`, body).pipe(
      tap((resp) => {
        if (resp && resp.token) {
          localStorage.setItem('jwt_token', resp.token);
          localStorage.setItem('active_user', username);
          this._current.next(username);
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    const body = { username, email, password };
    return this.http.post(`${this.baseUrl}/register`, body);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({ Authorization: 'Bearer ' + token });
    }
    return new HttpHeaders();
  }

  logout(): void {
    localStorage.removeItem('active_user');
    localStorage.removeItem('jwt_token');
    this._current.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
