import { createContext, useContext, useState } from "react";
import {
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_NOTICES,
  INITIAL_HALL_HIRE,
  DEMO_MEMBER,
} from "../data/mockData";

const DemoContext = createContext(null);

export function DemoProvider({ children }) {
  const [role, setRole] = useState("public"); // "public" | "member" | "admin"
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [hallHireBookings, setHallHireBookings] = useState(INITIAL_HALL_HIRE);
  const [currentMember, setCurrentMember] = useState(DEMO_MEMBER);
  const [rsvps, setRsvps] = useState({}); // { [eventId]: true }

  // Members
  const addMember = (member) => {
    const newMember = { ...member, id: `m${Date.now()}`, joinDate: new Date().toISOString().split("T")[0] };
    setMembers((prev) => [newMember, ...prev]);
    return newMember;
  };
  const updateMember = (id, updates) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    if (currentMember?.id === id) setCurrentMember((prev) => ({ ...prev, ...updates }));
  };
  const deleteMember = (id) => setMembers((prev) => prev.filter((m) => m.id !== id));

  // Events
  const addEvent = (event) => {
    const newEvent = { ...event, id: `ev${Date.now()}` };
    setEvents((prev) => [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
    return newEvent;
  };
  const updateEvent = (id, updates) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };
  const deleteEvent = (id) => setEvents((prev) => prev.filter((e) => e.id !== id));

  // Notices
  const addNotice = (notice) => {
    const newNotice = { ...notice, id: `n${Date.now()}`, postedAt: new Date().toISOString().split("T")[0] };
    setNotices((prev) => [newNotice, ...prev]);
    return newNotice;
  };
  const updateNotice = (id, updates) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };
  const deleteNotice = (id) => setNotices((prev) => prev.filter((n) => n.id !== id));
  const togglePinNotice = (id) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  // Hall Hire
  const addHallHireBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: `hh${Date.now()}`,
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0],
    };
    setHallHireBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };
  const updateBookingStatus = (id, status) => {
    setHallHireBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  // RSVPs
  const toggleRsvp = (eventId) => {
    setRsvps((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  // Half-day slot blocking: { date: ["morning"] | ["afternoon"] | ["morning","afternoon"] }
  // A date is "fully blocked" when both morning+afternoon are taken (or a fullday booking exists)
  const blockedSlots = {};
  hallHireBookings
    .filter((b) => b.status === "approved")
    .forEach((b) => {
      const slot = b.slot || "fullday";
      if (!blockedSlots[b.date]) blockedSlots[b.date] = [];
      if (slot === "fullday") {
        blockedSlots[b.date] = ["morning", "afternoon"];
      } else if (!blockedSlots[b.date].includes(slot)) {
        blockedSlots[b.date].push(slot);
      }
    });

  // Fully blocked = both slots taken
  const blockedDates = Object.keys(blockedSlots).filter(
    (d) => blockedSlots[d].includes("morning") && blockedSlots[d].includes("afternoon")
  );

  return (
    <DemoContext.Provider value={{
      role, setRole,
      members, addMember, updateMember, deleteMember,
      events, addEvent, updateEvent, deleteEvent,
      notices, addNotice, updateNotice, deleteNotice, togglePinNotice,
      hallHireBookings, addHallHireBooking, updateBookingStatus,
      blockedDates, blockedSlots,
      currentMember, setCurrentMember,
      rsvps, toggleRsvp,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
