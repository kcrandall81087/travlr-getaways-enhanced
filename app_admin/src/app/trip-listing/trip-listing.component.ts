import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TripCardComponent } from '../trip-card/trip-card.component';
import { Trip } from '../models/trip';
import {
  PaginationMetadata,
  TripDataService,
  TripListResponse
} from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TripCardComponent
  ],
  templateUrl: './trip-listing.component.html',
  styleUrl: './trip-listing.component.css',
  providers: [TripDataService]
})
export class TripListingComponent implements OnInit {
  trips: Trip[] = [];
  message = '';

  searchTerm = '';
  selectedSort = 'name';

  minPrice: number | null = null;
  maxPrice: number | null = null;
  duration = '';

  pageSize = 2;
  isLoading = false;

  pagination: PaginationMetadata = {
    page: 1,
    limit: this.pageSize,
    total: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };

  constructor(
    private tripDataService: TripDataService,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  public searchTrips(): void {
    this.loadTrips(1);
  }

  public clearSearch(): void {
    this.searchTerm = '';
    this.selectedSort = 'name';
    this.minPrice = null;
    this.maxPrice = null;
    this.duration = '';

    this.loadTrips(1);
  }

  public sortTrips(): void {
    this.loadTrips(1);
  }

  public previousPage(): void {
    if (this.pagination.hasPreviousPage) {
      this.loadTrips(this.pagination.page - 1);
    }
  }

  public nextPage(): void {
    if (this.pagination.hasNextPage) {
      this.loadTrips(this.pagination.page + 1);
    }
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  private loadTrips(page = 1): void {
    this.isLoading = true;
    this.message = '';

    this.tripDataService.getTrips({
      search: this.searchTerm,
      sort: this.selectedSort,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      duration: this.duration,
      page,
      limit: this.pageSize
    }).subscribe({
      next: (response: TripListResponse) => {
        this.trips = response.trips;
        this.pagination = response.pagination;

        if (this.pagination.total > 0) {
          this.message =
            `Showing ${this.trips.length} of ` +
            `${this.pagination.total} available trips.`;
        } else {
          this.message =
            'There were no trips retrieved from the database.';
        }

        this.isLoading = false;
        console.log(this.message);
      },
      error: (error: any) => {
        console.error('Unable to retrieve trips:', error);

        this.trips = [];
        this.pagination = {
          page: 1,
          limit: this.pageSize,
          total: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false
        };

        this.message =
          error?.error?.message ||
          'An error occurred while retrieving trips.';

        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.loadTrips();
  }
}