export type ProgramStatus =
  | "booked"
  | "confirmed"
  | "completed"
  | "cancelled";

export type ProgramType =
  | "temple_festival"
  | "wedding"
  | "concert"
  | "religious"
  | "corporate"
  | "private"
  | "other";

export type AvailabilityStatus = "available" | "blocked";

export interface Program {
  id: string;
  title: string;
  description: string | null;
  program_type: ProgramType | null;
  date: string; // ISO date (yyyy-mm-dd)
  start_time: string | null; // HH:mm
  end_time: string | null; // HH:mm
  location: string | null;
  status: ProgramStatus;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  status: AvailabilityStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export type EnquiryStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Negotiating"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "Lost";

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_type: string | null;
  event_date: string | null;
  event_location: string | null;
  message: string | null;
  source: string | null;
  status: EnquiryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppClick {
  id: string;
  page: string | null;
  program_id: string | null;
  visitor_id: string | null;
  created_at: string;
}

export interface VisitorEvent {
  id: string;
  visitor_id: string | null;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  device_type: string | null;
  created_at: string;
}

export interface StatSummary {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  totalPrograms: number;
  upcomingPrograms: number;
  completedPrograms: number;
  totalEnquiries: number;
  newEnquiries: number;
  whatsappClicks: number;
  whatsappToday: number;
  whatsappWeek: number;
  whatsappMonth: number;
  confirmedBookings: number;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface CrmSummary {
  New: number;
  Contacted: number;
  Interested: number;
  Negotiating: number;
  Confirmed: number;
  Completed: number;
  Cancelled: number;
  Lost: number;
}