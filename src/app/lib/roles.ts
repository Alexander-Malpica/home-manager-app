export type Role = "owner" | "member" | "guest";

export function canEdit(role: Role | undefined): boolean {
  return role === "owner" || role === "member";
}

export function isGuest(role: Role | undefined): boolean {
  return role === "guest";
}
