import { Inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { BROWSER_STORAGE } from '../storage';
import { Trip } from '../models/trip';

export interface TripQuery {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TripListResponse {
  trips: Trip[];
  pagination: PaginationMetadata;
}

@Injectable({
  providedIn: 'root'
})
export class TripDataService {
  private readonly baseUrl = 'http://localhost:3000/api';
  private readonly tripsUrl = `${this.baseUrl}/trips`;

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) {}

  getTrips(query: TripQuery = {}): Observable<TripListResponse> {
    let params = new HttpParams();

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    if (query.sort) {
      params = params.set('sort', query.sort);
    }

    if (query.page) {
      params = params.set('page', query.page.toString());
    }

    if (query.limit) {
      params = params.set('limit', query.limit.toString());
    }

    if (query.minPrice !== undefined && query.minPrice !== null) {
      params = params.set('minPrice',query.minPrice.toString());
    }

    if (query.maxPrice !== undefined && query.maxPrice !== null) {
      params = params.set('maxPrice', query.maxPrice.toString());
    }

    if (query.duration?.trim()) {params = params.set('duration', query.duration.trim());
    }

    return this.http.get<TripListResponse>(
      this.tripsUrl,
      { params }
    );
  }

  addTrip(formData: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.tripsUrl, formData);
  }

  getTrip(tripCode: string): Observable<Trip> {
    return this.http.get<Trip>(
      `${this.tripsUrl}/${encodeURIComponent(tripCode)}`
    );
  }

  updateTrip(formData: Trip): Observable<Trip> {
    return this.http.put<Trip>(
      `${this.tripsUrl}/${encodeURIComponent(formData.code)}`,
      formData
    );
  }

  login(user: User, passwd: string): Observable<AuthResponse> {
    return this.handleAuthAPICall('login', user, passwd);
  }

  register(user: User, passwd: string): Observable<AuthResponse> {
    return this.handleAuthAPICall('register', user, passwd);
  }

  private handleAuthAPICall(
    endpoint: string,
    user: User,
    passwd: string
  ): Observable<AuthResponse> {
    const formData = {
      name: user.name,
      email: user.email,
      password: passwd
    };

    return this.http.post<AuthResponse>(
      `${this.baseUrl}/${endpoint}`,
      formData
    );
  }
}