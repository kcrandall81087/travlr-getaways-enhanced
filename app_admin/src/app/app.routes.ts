import { Routes } from '@angular/router';

import { AddTripComponent } from './add-trip/add-trip.component';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { EditTripComponent } from './edit-trip/edit-trip.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: 'add-trip',
    component: AddTripComponent
  },
  {
    path: 'edit-trip',
    component: EditTripComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard]
  },
  {
    path: '',
    component: TripListingComponent,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];