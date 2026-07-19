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

@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StatusMessageComponent
  ],
  templateUrl: './add-trip.component.html',
  styleUrl: './add-trip.component.css'
})
export class AddTripComponent implements OnInit {
  addForm!: FormGroup;
  submitted = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripService: TripDataService
  ) {}

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      _id: [],
      code: ['', Validators.required],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  get f() {
    return this.addForm.controls;
  }

  public onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.tripService.addTrip(this.addForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Trip added successfully.';

        setTimeout(() => {
          this.router.navigate(['']);
        }, 750);
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'The trip could not be added.'
        );
      }
    });
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