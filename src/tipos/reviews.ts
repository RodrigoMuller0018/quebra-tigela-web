export interface Review {
  id: string;
  _id?: string;
  artistId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NovaReview {
  artistId: string;
  userId: string;
  rating: number;
  comment?: string;
}
