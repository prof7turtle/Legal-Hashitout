import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CaseStatusTracker } from './CaseStatusTracker';

interface Event {
  id?: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  caseNumber?: string;
  parties?: string;
  type?: 'hearing' | 'conference' | 'trial';
  description?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  color?: string;
  display?: 'block' | 'background';
  currentStage?: string;
}

// Supreme Court Holidays 2026
const HOLIDAYS_2026: Event[] = [
  { title: 'New Year Holiday', start: '2026-01-01', end: '2026-01-02', color: '#ff9f89', display: 'background' },
  { title: 'Makar Sankranti/Magh Bihu/Pongal', start: '2026-01-14', color: '#ff9f89', display: 'background' },
  { title: 'Republic Day', start: '2026-01-26', color: '#ff9f89', display: 'background' },
  { title: 'Holi Holidays', start: '2026-03-02', end: '2026-03-07', color: '#ff9f89', display: 'background' },
  { title: 'Id-ul-Fitr', start: '2026-03-21', color: '#ff9f89', display: 'background' },
  { title: 'Ram Navami', start: '2026-03-26', color: '#ff9f89', display: 'background' },
  { title: 'Mahavir Jayanti', start: '2026-03-31', color: '#ff9f89', display: 'background' },
  { title: 'Good Friday', start: '2026-04-03', color: '#ff9f89', display: 'background' },
  { title: 'Buddha Purnima', start: '2026-05-01', color: '#ff9f89', display: 'background' },
  { title: 'Id-ul-Zuha (Bakrid)', start: '2026-05-27', color: '#ff9f89', display: 'background' },
  { title: 'Muharram', start: '2026-06-26', color: '#ff9f89', display: 'background' },
  { title: 'Independence Day', start: '2026-08-15', color: '#ff9f89', display: 'background' },
  { title: 'Janmashtami', start: '2026-09-04', color: '#ff9f89', display: 'background' },
  { title: 'Ganesh Chaturthi', start: '2026-09-14', color: '#ff9f89', display: 'background' },
  { title: 'Mahatma Gandhi Birthday', start: '2026-10-02', color: '#ff9f89', display: 'background' },
  { title: 'Dussehra Holidays', start: '2026-10-19', end: '2026-10-24', color: '#ff9f89', display: 'background' },
  { title: 'Diwali Holidays', start: '2026-11-09', end: '2026-11-14', color: '#ff9f89', display: 'background' },
  { title: 'Guru Nanak Birthday', start: '2026-11-24', color: '#ff9f89', display: 'background' },
  { title: 'Christmas & New Year Holidays', start: '2026-12-21', end: '2026-12-31', color: '#ff9f89', display: 'background' }
];

// Partial Court Working Days 2026
const PARTIAL_WORKING_DAYS_2026: Event[] = [
  { 
    title: 'Partial Court Working (Summer Vacation)', 
    start: '2026-06-01', 
    end: '2026-07-12', 
    color: '#fff2b2', 
    display: 'background' 
  }
];

const Legend = () => (
  <div className="flex flex-wrap gap-4 items-center mt-4 text-sm p-4 bg-secondary/10 rounded-lg">
    <div className="flex items-center">
      <div className="w-4 h-4 rounded bg-[#ff9f89] mr-2"></div>
      <span>Holidays</span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 rounded bg-[#fff2b2] mr-2"></div>
      <span>Partial Working Days</span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
      <span>Court Events</span>
    </div>
  </div>
);

const Notes = () => (
  <Card className="mt-4 p-4">
    <h3 className="font-semibold mb-2 text-primary">Important Notes:</h3>
    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
      <li>Court working hours: 10:30 AM to 4:30 PM</li>
      <li>Partial Court working days (Summer Vacation): June 1 - July 12, 2026</li>
      <li>Sundays are non-working days</li>
      <li>The Court will remain closed during Christmas/New Year holidays (Dec 21, 2026 - Jan 1, 2027)</li>
    </ul>
  </Card>
);

export function CourtCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});

  useEffect(() => {
    // Combine all calendar events
    setEvents([
      ...HOLIDAYS_2026,
      ...PARTIAL_WORKING_DAYS_2026,
    ]);
  }, []);

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event && !event.display) {  // Only show modal for regular events, not holidays
      setSelectedEvent(event);
      setIsEventModalOpen(true);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const date = new Date(selectInfo.start);
    
    // Check if it's a holiday
    const isHoliday = HOLIDAYS_2026.some(holiday => {
      const holidayStart = new Date(holiday.start);
      const holidayEnd = holiday.end ? new Date(holiday.end) : holidayStart;
      return date >= holidayStart && date <= holidayEnd;
    });

    // Check if it's a Sunday
    const isSunday = date.getDay() === 0;

    if (!isHoliday && !isSunday) {
      setNewEvent({
        start: selectInfo.start,
        end: selectInfo.end,
      });
      setIsNewEventModalOpen(true);
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      const event: Event = {
        id: Math.random().toString(36).substr(2, 9),
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        caseNumber: newEvent.caseNumber,
        parties: newEvent.parties,
        type: newEvent.type as 'hearing' | 'conference' | 'trial',
        description: newEvent.description,
        status: 'scheduled',
        color: '#3b82f6' // Blue color for court events
      };
      setEvents(prevEvents => [...prevEvents, event]);
      setIsNewEventModalOpen(false);
      setNewEvent({});
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-background rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">Supreme Court Calendar 2026</h2>
          <p className="text-muted-foreground">Court schedule and holidays based on Indian Judiciary</p>
        </div>

        <div className="rounded-lg border bg-card">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventClick={handleEventClick}
            select={handleDateSelect}
            height="auto"
            contentHeight={800}
            slotMinTime="10:30:00"
            slotMaxTime="16:30:00"
            allDaySlot={true}
            slotDuration="00:30:00"
            selectConstraint={{
              start: '2026-01-01',
              end: '2026-12-31',
            }}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '10:30',
              endTime: '16:30',
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: true
            }}
            eventDidMount={(info) => {
              if (info.event.display === 'background') {
                info.el.style.opacity = '0.7';
              }
            }}
          />
        </div>

        <Legend />
        <Notes />
      </div>

      {/* Event Details Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Case Details and Schedule Information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              {selectedEvent?.status && (
                <Badge variant={selectedEvent?.status === 'scheduled' ? 'default' : 
                             selectedEvent?.status === 'completed' ? 'outline' : 'destructive'}>
                  {selectedEvent?.status}
                </Badge>
              )}
              {selectedEvent?.caseNumber && <p><strong>Case Number:</strong> {selectedEvent?.caseNumber}</p>}
              {selectedEvent?.parties && <p><strong>Parties:</strong> {selectedEvent?.parties}</p>}
              {selectedEvent?.type && <p><strong>Type:</strong> {selectedEvent?.type}</p>}
              {selectedEvent?.description && <p><strong>Description:</strong> {selectedEvent?.description}</p>}
              {selectedEvent?.start && typeof selectedEvent.start !== 'string' && (
                <p><strong>Time:</strong> {selectedEvent.start.toLocaleTimeString()} - {selectedEvent.end?.toString()}</p>
              )}
            </div>

            {/* Add Case Status Tracker if it's a case event */}
            {selectedEvent?.caseNumber && (
              <div className="border-t pt-4">
                <CaseStatusTracker 
                  caseNumber={selectedEvent.caseNumber}
                  currentStage={selectedEvent.currentStage || 'Filing'}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Event Modal */}
      <Dialog open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule New Court Event</DialogTitle>
            <DialogDescription>
              Enter the details for the new court event
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                value={newEvent.caseNumber || ''}
                onChange={(e) => setNewEvent({ ...newEvent, caseNumber: e.target.value })}
                placeholder="Enter case number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parties">Parties</Label>
              <Input
                id="parties"
                value={newEvent.parties || ''}
                onChange={(e) => setNewEvent({ ...newEvent, parties: e.target.value })}
                placeholder="Enter parties involved"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Enter event description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewEventModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 