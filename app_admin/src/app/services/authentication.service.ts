import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from '../services/trip-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripDataService
  ) {}

  public getToken(): string {
    return this.storage.getItem('travlr-token') ?? '';
  }

  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
  }

  public logout(): void {
    this.storage.removeItem('travlr-token');
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();

    if (!token || token === 'undefined' || token.split('.').length !== 3) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  public getCurrentUser(): User {
    const token = this.getToken();
    const { email, name } = JSON.parse(atob(token.split('.')[1]));

    return { email, name } as User;
  }

  public login(user: User, password: string): Observable<AuthResponse | string> {
    return this.tripDataService.login(user, password).pipe(
      tap((response: AuthResponse | string) => {
        const token =
          typeof response === 'string'
            ? response
            : response.token;

        this.saveToken(token);
      })
    );
  }

  public register(user: User, password: string): Observable<AuthResponse | string> {
    return this.tripDataService.register(user, password).pipe(
      tap((response: AuthResponse | string) => {
        const token =
          typeof response === 'string'
            ? response
            : response.token;

        this.saveToken(token);
      })
    );
  }
}