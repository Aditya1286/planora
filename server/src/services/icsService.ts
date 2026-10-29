import { IEvent } from '../models';

const formatIcsDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const generateIcsContent = (event: IEvent, venueName?: string): string => {
  const now = formatIcsDate(new Date());
  const start = formatIcsDate(new Date(event.startDate));
  const end = formatIcsDate(new Date(event.endDate));
  const location = venueName || event.onlineUrl || 'Planora Virtual Event';
  const cleanDescription = (event.shortDescription || event.description || '').replace(/\r?\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planora//Event Management Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:planora-${event._id}-${Date.now()}@planora.dev`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${location}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};
