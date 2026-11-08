// Shared by the server helper (adminFlash.ts) and the client banner
// (components/admin/AdminFlashBanner.tsx). No server-only imports here.

export const ADMIN_FLASH_COOKIE = "ww_admin_flash";

export type AdminFlash = {
  type: "success" | "error";
  message: string;
  // Changes on every action, so the same message twice in a row still shows.
  id: number;
};

export function parseAdminFlash(raw: string | undefined): AdminFlash | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw)) as Partial<AdminFlash>;
    if ((v.type === "success" || v.type === "error") && typeof v.message === "string" && typeof v.id === "number") {
      return { type: v.type, message: v.message, id: v.id };
    }
  } catch {
    // Malformed cookie: ignore it.
  }
  return null;
}
