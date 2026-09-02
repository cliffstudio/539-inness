"use client";

import { ReactNode } from "react";
import { BookingProvider } from "@/contexts/BookingContext";
import { BasketProvider } from "@/contexts/BasketContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <BookingProvider>
      <BasketProvider>{children}</BasketProvider>
    </BookingProvider>
  );
}
