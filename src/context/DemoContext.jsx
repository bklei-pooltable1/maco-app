import { createContext, useContext, useState } from "react";
import { TIERS } from "../lib/tiers";
import {
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_NOTICES,
  INITIAL_HALL_HIRE,
  DEMO_MEMBER,
  DEMO_ADMIN,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADMIN_NOTIFICATION_PREFS,
} from "../data/mockData";

const DemoContext = createContext(null);

export function DemoProvider({ children }) {
  const [role, setRole] = useState("public"); // "public" | "member" | "admin"
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [hallHireBookings, setHallHireBookings] = useState(INITIAL_HALL_HIRE);
  const [currentMember, setCurrentMember] = useState(DEMO_MEMBER);
  const [currentAdmin, setCurrentAdmin] = useState(DEMO_ADMIN);
  const [rsvps, setRsvps] = useState({}); // { [eventId]: true }
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [adminNotificationPrefs, setAdminNotificationPrefs] = useState(INITIAL_ADMIN_NOTIFICATION_PREFS);

  // Notifications — defined before addMember / addHallHireBooking to avoid ordering concerns
  const addNotification = (notification) => {
    const category =
      notification.category ??
      (notification.type?.startsWith("notice_") ? "noticeboard"
        : notification.type?.startsWith("event_") ? "events"
        : undefined);
    const newNotification = {
      ...notification,
      category,
      id: `notif${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientCount: notification.recipientCount ?? members.length,
      triggeredBy: notification.triggeredBy ?? "Admin",
    };
    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification;
  };
  const dismissNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearNotifications = () => setNotifications([]);

  const updateAdminNotificationPrefs = (category, channel, value) => {
    setAdminNotificationPrefs((prev) => ({
      ...prev,
      [category]: { ...prev[category], [channel]: value },
    }));
  };

  // Members
  const addMember = (member) => {
    const newMember = { ...member, id: `m${Date.now()}`, tier: member.tier ?? "general", joinDate: new Date().toISOString().split("T")[0] };
    setMembers((prev) => [newMember, ...prev]);
    addNotification({
      audience: "admin",
      category: "signups",
      title: "New member signed up",
      message: `${newMember.fullName} joined as a new ${newMember.planType || "Individual"} member.`,
    });
    return newMember;
  };
  const updateMember = (id, updates) => {
    if (updates.tier !== undefined) {
      const current = members.find(m => m.id === id);
      if (current && updates.tier !== current.tier) {
        addNotification({
          audience: "community",
          category: "account",
          recipientId: id,
          title: "Membership tier updated",
          message: `Your membership tier has been updated to ${TIERS[updates.tier]?.label ?? updates.tier}.`,
        });
      }
    }
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    if (currentMember?.id === id) setCurrentMember((prev) => ({ ...prev, ...updates }));
  };
  const deleteMember = (id) => setMembers((prev) => prev.filter((m) => m.id !== id));
  const updateMemberPosition = (memberId, { adminPosition, isSuperAdmin: isSA }) => {
    const updates = { adminPosition: adminPosition ?? null, isSuperAdmin: isSA ?? false };
    const current = members.find(m => m.id === memberId);
    const currentPosition = current?.adminPosition ?? null;
    const newPosition = updates.adminPosition;
    if (currentPosition !== newPosition) {
      addNotification({
        audience: "community",
        category: "account",
        recipientId: memberId,
        title: "Committee position updated",
        message: newPosition
          ? `Your committee position has been updated to ${newPosition}.`
          : "Your committee position has been removed.",
      });
    }
    updateMember(memberId, updates);
    if (currentAdmin?.id === memberId) setCurrentAdmin(prev => ({ ...prev, ...updates }));
  };

  // Events
  const addEvent = (event) => {
    const newEvent = { ...event, id: `ev${Date.now()}`, visibility: event.visibility ?? "general" };
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
    addNotification({
      audience: "admin",
      category: "hallHire",
      title: "New hall hire enquiry",
      message: `${newBooking.name} requested the hall for ${newBooking.dateDisplay || newBooking.date}.`,
    });
    return newBooking;
  };
  const updateBookingStatus = (id, status) => {
    setHallHireBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  // RSVPs
  const toggleRsvp = (eventId) => {
    setRsvps((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const updateNotificationPrefs = (memberId, category, channel, value) => {
    const applyPrefs = (m) => ({
      ...m,
      notificationPrefs: {
        ...m.notificationPrefs,
        [category]: { ...(m.notificationPrefs?.[category] ?? {}), [channel]: value },
      },
    });
    setMembers((prev) => prev.map((m) => m.id === memberId ? applyPrefs(m) : m));
    if (currentMember?.id === memberId) setCurrentMember((prev) => applyPrefs(prev));
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
      currentAdmin, setCurrentAdmin,
      updateMemberPosition,
      rsvps, toggleRsvp,
      notifications, addNotification, dismissNotification, clearNotifications,
      updateNotificationPrefs,
      adminNotificationPrefs, updateAdminNotificationPrefs,
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
