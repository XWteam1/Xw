export const ROLES = ["CREATOR", "STAKEHOLDER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type UserStatus = (typeof STATUSES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function isUserStatus(value: string): value is UserStatus {
  return (STATUSES as readonly string[]).includes(value);
}

export function roleLabel(role: string): string {
  switch (role) {
    case "CREATOR":
      return "Creator";
    case "STAKEHOLDER":
      return "Stakeholder";
    case "ADMIN":
      return "Admin";
    default:
      return role;
  }
}
