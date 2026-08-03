export interface RoomBookingPayload {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
}

const ROOM_BOOKING_URL =
  "https://res.windsurfercrs.com/ibe/index.aspx?propertyID=16732";

/** Format a date as MM/DD/YYYY for Windsurfer CRS (EN-US). */
export function formatDateForBooking(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export function openRoomBooking(payload: RoomBookingPayload = {}): void {
  if (typeof window === "undefined") return;

  const url = new URL(ROOM_BOOKING_URL);

  if (payload.checkIn) url.searchParams.set("checkin", payload.checkIn);
  if (payload.checkOut) url.searchParams.set("checkout", payload.checkOut);
  if (typeof payload.adults === "number") {
    url.searchParams.set("adults", String(payload.adults));
  }
  if (typeof payload.children === "number") {
    url.searchParams.set("children", String(payload.children));
  }

  window.open(url.toString(), "_blank", "noopener,noreferrer");
}
