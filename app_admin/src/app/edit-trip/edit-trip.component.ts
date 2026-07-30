import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { TripDataService } from '../services/trip-data.service';
import { StatusMessageComponent } from '../status-message/status-message.component';

import {
  Trip,
  TripCategory
} from '../models/trip';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StatusMessageComponent
  ],
  templateUrl: './edit-trip.component.html',
  styleUrl: './edit-trip.component.css'
})
export class EditTripComponent implements OnInit {
  editForm!: FormGroup;
  submitted = false;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  categories: TripCategory[] = [];
  isLoadingCategories = false;
  averageRating = 0;
  reviewCount = 0;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripService: TripDataService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    this.editForm = this.formBuilder.group({
      _id: [],
      code: ['', Validators.required],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      category: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required]
    });

    const tripCode = localStorage.getItem('tripCode');

    if (!tripCode) {
      this.isLoading = false;
      this.errorMessage = 'No trip was selected for editing.';
      return;
    }

    this.tripService.getTrip(tripCode).subscribe({
      next: (data: Trip) => {
        this.editForm.patchValue({
          ...data,
          start: this.formatDateForInput(data.start),
          category: data.category?._id ?? ''
        });

        this.averageRating = data.averageRating ?? 0;
        this.reviewCount = data.reviewCount ?? 0;

        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'The trip could not be loaded.'
        );
      }
    });
  }

  get f() {
    return this.editForm.controls;
  }

  private loadCategories(): void {
    this.isLoadingCategories = true;

    this.tripService.getCategories().subscribe({
      next: (categories: TripCategory[]) => {
        this.categories = categories;
        this.isLoadingCategories = false;
      },
      error: () => {
        this.isLoadingCategories = false;
        this.errorMessage =
          'Trip categories could not be loaded.';
      }
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.tripService.updateTrip(this.editForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Trip updated successfully.';

        setTimeout(() => {
          this.router.navigate(['']);
        }, 750);
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'The trip could not be updated.'
        );
      }
    });
  }

  private formatDateForInput(value: string | Date): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().split('T')[0];
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallbackMessage: string
  ): string {
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors
        .map((item: { message?: string }) => item.message)
        .filter(Boolean)
        .join(' ');
    }

    return error.error?.message || fallbackMessage;
  }
}