/**
 * Placeholder data for the admin screens.
 *
 * Field names are deliberately snake_case and flat so each type maps 1:1 onto a
 * Supabase table. When the database is wired up, replace the exported arrays
 * with queries and leave the types and components untouched.
 *
 *   bookings      -> select * from bookings
 *   carers        -> select * from carers
 *   applications  -> select * from applications
 */

export type BookingStatus = "pending" | "assigned" | "active" | "completed";

export type Booking = {
  id: string;
  client_name: string;
  care_needed: string;
  location: string;
  start_date: string;
  status: BookingStatus;
  /** carers.id, or null while nobody is assigned yet */
  assigned_carer_id: string | null;
  contact_phone: string;
  notes: string;
};

export type Carer = {
  id: string;
  full_name: string;
  /** Public URL from Supabase storage. Empty string shows initials instead. */
  photo_url: string;
  short_bio: string;
  specialty: string;
};

export type ApplicationStatus = "new" | "accepted" | "not_now";

/**
 * Shares full_name / photo_url / short_bio / specialty with Carer on purpose, so
 * accepting an application can be turned into a carer profile without remapping
 * fields. See applicationToCarerDraft below.
 */
export type Application = {
  id: string;
  full_name: string;
  photo_url: string;
  short_bio: string;
  specialty: string;
  availability: string;
  years_experience: string;
  message: string;
  status: ApplicationStatus;
  applied_on: string;
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  active: "Active",
  completed: "Completed",
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = ["pending", "assigned", "active", "completed"];

export const bookings: Booking[] = [
  {
    id: "bk-1001",
    client_name: "Margaret Hollis",
    care_needed: "Live-in care, full time",
    location: "Workington",
    start_date: "3 October 2026",
    status: "pending",
    assigned_carer_id: null,
    contact_phone: "+44 7584 920625",
    notes: "Daughter called. Mum needs help with mornings, meals and medication reminders.",
  },
  {
    id: "bk-1002",
    client_name: "Arthur Bell",
    care_needed: "Live-in care, weekdays",
    location: "Whitehaven",
    start_date: "12 October 2026",
    status: "assigned",
    assigned_carer_id: "cr-2002",
    contact_phone: "+44 7700 100200",
    notes: "Early stage dementia. Prefers a quiet routine and a walk after lunch.",
  },
  {
    id: "bk-1003",
    client_name: "Joan Whitfield",
    care_needed: "Live-in care, full time",
    location: "Cockermouth",
    start_date: "Started 1 September 2026",
    status: "active",
    assigned_carer_id: "cr-2001",
    contact_phone: "+44 7700 300400",
    notes: "Settled in well. Family asked for a short update call every Friday.",
  },
  {
    id: "bk-1004",
    client_name: "Peter Greaves",
    care_needed: "Respite care, two weeks",
    location: "Maryport",
    start_date: "Ended 20 August 2026",
    status: "completed",
    assigned_carer_id: "cr-2003",
    contact_phone: "+44 7700 500600",
    notes: "Cover while the family were away. Happy to use Gracefield again.",
  },
];

export const carers: Carer[] = [
  {
    id: "cr-2001",
    full_name: "Grace Adeyemi",
    photo_url: "",
    short_bio: "Twelve years in live-in care. Calm, patient and good with early routines.",
    specialty: "Dementia care",
  },
  {
    id: "cr-2002",
    full_name: "Daniel Okoro",
    photo_url: "",
    short_bio: "Former hospital healthcare assistant. Confident with mobility support.",
    specialty: "Mobility support",
  },
  {
    id: "cr-2003",
    full_name: "Ruth Ellery",
    photo_url: "",
    short_bio: "Cooks beautifully and keeps families updated without being asked.",
    specialty: "Companionship",
  },
];

export const applications: Application[] = [
  {
    id: "ap-3001",
    full_name: "Blessing Nwosu",
    photo_url: "",
    short_bio: "Six years supporting older people at home, mostly overnight care.",
    specialty: "Overnight care",
    availability: "Full-time live-in",
    years_experience: "5 to 10 years",
    message:
      "I have looked after older people in their own homes for six years, most recently a gentleman with Parkinson's. I am happiest in a steady routine and I drive.",
    status: "new",
    applied_on: "14 September 2026",
  },
  {
    id: "ap-3002",
    full_name: "Marek Kowalski",
    photo_url: "",
    short_bio: "Two years in a residential home, now looking for live-in work.",
    specialty: "Personal care",
    availability: "Part-time",
    years_experience: "1 to 3 years",
    message:
      "I worked two years in a residential home in Carlisle and would like to move into live-in care. I am available weekends and most weekdays.",
    status: "new",
    applied_on: "11 September 2026",
  },
  {
    id: "ap-3003",
    full_name: "Sandra Bright",
    photo_url: "",
    short_bio: "Fifteen years in care, including end of life support.",
    specialty: "End of life care",
    availability: "Full-time live-in",
    years_experience: "More than 10 years",
    message:
      "I have fifteen years of experience and hold an NVQ Level 3. I have supported several families through end of life care at home.",
    status: "new",
    applied_on: "8 September 2026",
  },
];

/**
 * Turns an accepted application into the fields a new carer row needs.
 * Wire this into an insert on the carers table once Supabase is connected.
 */
export function applicationToCarerDraft(application: Application): Omit<Carer, "id"> {
  return {
    full_name: application.full_name,
    photo_url: application.photo_url,
    short_bio: application.short_bio,
    specialty: application.specialty,
  };
}

export function carerName(carerId: string | null, list: Carer[] = carers): string {
  if (!carerId) return "Nobody yet";
  return list.find((carer) => carer.id === carerId)?.full_name ?? "Nobody yet";
}

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
