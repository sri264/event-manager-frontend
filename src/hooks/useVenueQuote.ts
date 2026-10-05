import { useQuery } from '@tanstack/react-query';
import { venuesApi } from '@/lib/api/venues';

export function useBookedDates(venueId?: number) {
  return useQuery({
    queryKey: ['venues', venueId, 'booked-dates'],
    queryFn: () => venuesApi.bookedDates(venueId!),
    enabled: !!venueId,
  });
}

export function useVenueQuote(venueId: number | undefined, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['venues', venueId, 'quote', startDate, endDate],
    queryFn: () => venuesApi.quote(venueId!, startDate, endDate),
    enabled: !!venueId && !!startDate && !!endDate,
    retry: false,
    staleTime: 15_000,
  });
}
