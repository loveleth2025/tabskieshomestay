// app/api/bookings/[unit]/unavailable-dates/route.ts
import { UNIT_CALENDARS } from '@/lib/calendar-config';

// Parse iCalendar format manually (no external dependency)
function parseICalendar(icsContent: string): Array<{ start: Date; end: Date }> {
  const events: Array<{ start: Date; end: Date }> = [];

  // Find all VEVENT blocks
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;

  while ((match = eventRegex.exec(icsContent)) !== null) {
    const eventContent = match[1];

    // Extract DTSTART and DTEND (handle both date and datetime formats)
    const startMatch = eventContent.match(/DTSTART(?:;[^:]*)?:([^\r\n]+)/);
    const endMatch = eventContent.match(/DTEND(?:;[^:]*)?:([^\r\n]+)/);

    if (startMatch && endMatch) {
      const startStr = startMatch[1].trim();
      const endStr = endMatch[1].trim();

      // Parse date string (format: YYYYMMDD or YYYYMMDDTHHMMSSZ)
      const parseDate = (dateStr: string): Date => {
        if (dateStr.length === 8) {
          // Format: YYYYMMDD (all-day event) - parse as local date
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6)) - 1;
          const day = parseInt(dateStr.substring(6, 8));
          return new Date(year, month, day);
        } else {
          // Format: YYYYMMDDTHHMMSSZ
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6)) - 1;
          const day = parseInt(dateStr.substring(6, 8));
          const hour = parseInt(dateStr.substring(9, 11));
          const minute = parseInt(dateStr.substring(11, 13));
          const second = parseInt(dateStr.substring(13, 15));
          return new Date(year, month, day, hour, minute, second);
        }
      };

      events.push({
        start: parseDate(startStr),
        end: parseDate(endStr),
      });
    }
  }

  return events;
}

// Convert date range to array of date strings (YYYY-MM-DD) using local timezone
function getBookedDateStrings(events: Array<{ start: Date; end: Date }>): string[] {
  const bookedDates = new Set<string>();

  for (const event of events) {
    const current = new Date(event.start);
    // Include all dates from start to end (exclusive of end)
    while (current < event.end) {
      // Format using local timezone, not UTC
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      bookedDates.add(dateStr);
      current.setDate(current.getDate() + 1);
    }
  }

  return Array.from(bookedDates).sort();
}

export async function GET(
  request: Request,
  { params }: { params: { unit: string } }
) {
  try {
    const unit = params.unit;
    const calendarUrl = UNIT_CALENDARS[unit];

    if (!calendarUrl) {
      return Response.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    // Fetch the iCalendar file
    const response = await fetch(calendarUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch calendar');
    }

    const icsContent = await response.text();

    // Parse the iCalendar
    const events = parseICalendar(icsContent);

    // Get booked dates
    const bookedDates = getBookedDateStrings(events);

    return Response.json({
      unavailableDates: bookedDates,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    return Response.json(
      { error: 'Failed to fetch unavailable dates' },
      { status: 500 }
    );
  }
}
