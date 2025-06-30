export type Role = "owner" | "member" | "guest";

/**
 * Determines if the role has editing permissions.
 * @param role - The role of the user.
 * @returns True if the role can edit.
 */
export const canEdit = (role?: Role): boolean =>
  role === "owner" || role === "member";

/**
 * Determines if the role is a guest.
 * @param role - The role of the user.
 * @returns True if the role is guest.
 */
export const isGuest = (role?: Role): boolean => role === "guest";
