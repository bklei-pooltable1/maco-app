export const POSITIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
  "Committee Member",
  "Admin",
];

export function isAdmin(member) {
  return !!member?.adminPosition;
}

export function isSuperAdmin(member) {
  return !!member?.isSuperAdmin;
}
