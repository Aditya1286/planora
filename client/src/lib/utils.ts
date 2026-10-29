import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';
import { jsPDF } from 'jspdf';
import { Booking } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatEventDate(dateString: string, formatStr: string = 'EEE, MMM d, yyyy • h:mm a'): string {
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(d)) return '';
    return format(d, formatStr);
  } catch {
    return '';
  }
}

export function generateTicketPDF(booking: Booking): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [0, 71, 171]; // Cobalt Blue #0047AB
  const accentColor = [255, 201, 60]; // Sun Yellow #FFC93C
  const darkInk = [26, 26, 46]; // Deep Ink #1A1A2E

  // Outer Border & Card
  doc.setFillColor(251, 247, 238); // Soft Ivory #FBF7EE
  doc.roundedRect(15, 15, 180, 240, 6, 6, 'F');
  doc.setDrawColor(232, 220, 200); // Warm Beige #E8DCC8
  doc.setLineWidth(1);
  doc.roundedRect(15, 15, 180, 240, 6, 6, 'D');

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(15, 15, 180, 35, 6, 6, 'F');
  // Cover bottom corners of header
  doc.rect(15, 40, 180, 10, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PLANORA', 25, 34);

  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL EVENT ACCESS PASS', 25, 42);

  // Booking Reference Pill
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(125, 26, 60, 16, 4, 4, 'F');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`REF: ${booking.bookingReference}`, 130, 37);

  // Event Details
  doc.setTextColor(darkInk[0], darkInk[1], darkInk[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const eventTitle = booking.eventId?.title || 'Planora Experience';
  const splitTitle = doc.splitTextToSize(eventTitle, 160);
  doc.text(splitTitle, 25, 65);

  let curY = 65 + splitTitle.length * 8;

  // Date and Time
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DATE & TIME', 25, curY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkInk[0], darkInk[1], darkInk[2]);
  const dateFormatted = formatEventDate(booking.eventId?.startDate);
  doc.text(dateFormatted, 25, curY + 6);

  // Location / Venue
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('LOCATION / VENUE', 105, curY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkInk[0], darkInk[1], darkInk[2]);
  const venueText = booking.eventId?.venueId
    ? `${booking.eventId.venueId.name}, ${booking.eventId.venueId.city}`
    : booking.eventId?.format === 'online'
    ? 'Virtual Event (Access Link in Account)'
    : 'Venue Announced via Email';
  doc.text(doc.splitTextToSize(venueText, 80), 105, curY + 6);

  curY += 24;

  // Horizontal divider
  doc.setDrawColor(232, 220, 200);
  doc.line(25, curY, 185, curY);

  curY += 12;

  // Attendee Info
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkInk[0], darkInk[1], darkInk[2]);
  doc.setFontSize(11);
  doc.text('PRIMARY ATTENDEE', 25, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.attendeeDetails[0]?.name || booking.userId?.name || 'Attendee', 25, curY + 6);
  doc.text(booking.attendeeDetails[0]?.email || booking.userId?.email || '', 25, curY + 12);

  // Ticket Tier Info
  doc.setFont('helvetica', 'bold');
  doc.text('TICKET TIER & QTY', 105, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${booking.ticketTypeId?.name || 'General Admission'} (x${booking.quantity})`, 105, curY + 6);
  doc.text(`Total Paid: ${formatCurrency(booking.totalAmount)}`, 105, curY + 12);

  curY += 26;

  // QR Code Image
  if (booking.qrCodeData) {
    try {
      doc.addImage(booking.qrCodeData, 'PNG', 65, curY, 80, 80);
    } catch (e) {
      console.warn('QR code add failed in PDF:', e);
    }
  }

  // Footer Instructions
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 130);
  doc.text('Present this digital or printed pass with valid photo identification upon arrival.', 105, 235, {
    align: 'center',
  });
  doc.text('Powered by Planora — Next-Generation Event Platform', 105, 242, { align: 'center' });

  doc.save(`Planora-Ticket-${booking.bookingReference}.pdf`);
}
