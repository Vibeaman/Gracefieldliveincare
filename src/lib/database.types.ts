export type BookingStatus = "pending" | "assigned" | "active" | "completed";
export type ApplicationStatus = "pending" | "accepted" | "declined";
export type EnquirySubject = "care" | "referral" | "careers";

export type Client = {
  id: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
};

export type Carer = {
  id: string;
  name: string;
  bio: string;
  photo_url: string;
  specialty: string;
  created_at: string;
};

export type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  years_experience: string;
  availability: string;
  about: string;
  photo_url: string;
  status: ApplicationStatus;
  created_at: string;
};

export type Booking = {
  id: string;
  client_id: string;
  care_type: string;
  location: string;
  start_date: string;
  hours: string;
  status: BookingStatus;
  assigned_carer_id: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  booking_id: string;
  carer_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Enquiry = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subject: EnquirySubject;
  message: string;
  created_at: string;
};

export type BookingWithCarer = Booking & {
  carer: Pick<Carer, "id" | "name" | "photo_url" | "bio"> | null;
  review: Pick<Review, "id" | "rating" | "comment"> | null;
};

export type AdminBooking = Booking & {
  client: Pick<Client, "id" | "full_name" | "phone"> | null;
  carer: Pick<Carer, "id" | "name"> | null;
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  active: "Active",
  completed: "Completed",
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  "pending",
  "assigned",
  "active",
  "completed",
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Waiting",
  accepted: "Accepted",
  declined: "Not right now",
};

export const ENQUIRY_SUBJECT_LABELS: Record<EnquirySubject, string> = {
  care: "Live-in care for a family member",
  referral: "Referral",
  careers: "Careers / becoming a carer",
};

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
