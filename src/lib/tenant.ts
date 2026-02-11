// src/lib/tenant.ts

export function getTenant(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_TENANT || "mstudios";
  }
  return process.env.TENANT || "mstudios";
}

export function isTenant(tenant: string): boolean {
  return getTenant() === tenant;
}

export function useTenant(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_TENANT || "mstudios";
  }
  return process.env.TENANT || "mstudios";
}
