import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _current = new BehaviorSubject<User | null>(null);
  public current$ = this._current.asObservable();

  constructor(private http: HttpClient) {
    const raw = localStorage.getItem('chatu_user');
    if (raw) {
      this._current.next(JSON.parse(raw));
    }
  }

  register(username: string, email: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('username', username)
      .set('email', email)
      .set('password', password);
    return this.http.post('/api/auth/register', body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    });
  }

  login(username: string, password: string): Observable<User> {
    const user: User = { username };
    localStorage.setItem('chatu_user', JSON.stringify(user));
    localStorage.setItem('chatu_credentials', btoa(username + ':' + password));
    this._current.next(user);
    return of(user);
  }

  logout(): void {
    localStorage.removeItem('chatu_user');
    localStorage.removeItem('chatu_credentials');
    this._current.next(null);
  }

  getAuthHeaders(): HttpHeaders {
    const cred = localStorage.getItem('chatu_credentials');
    if (cred) {
      return new HttpHeaders({ Authorization: 'Basic ' + cred });
    }
    return new HttpHeaders();
  }
}
