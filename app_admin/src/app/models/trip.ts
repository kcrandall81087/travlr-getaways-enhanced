export interface TripCategory {
  _id: string;
  name: string;
  description?: string;
}

export interface TripReview {
  _id: string;
  trip: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSubmission {
  reviewerName: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  review: TripReview;
  ratingSummary: {
    averageRating: number;
    reviewCount: number;
  };
}

export interface Trip {
  _id: string;
  code: string;
  name: string;
  length: string;
  start: string;
  resort: string;
  perPerson: number;
  image: string;
  description: string;
  category?: TripCategory;
  averageRating?: number;
  reviewCount?: number;
}