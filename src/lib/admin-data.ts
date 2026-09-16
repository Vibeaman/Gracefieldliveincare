/**
 * Shared admin helpers. Live data now comes from Supabase via admin.functions.ts.
 * These labels stay here so older imports keep working.
 */

export {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_ORDER,
  initials,
  type Application,
  type BookingStatus,
  type Carer,
} from "@/lib/database.types";
