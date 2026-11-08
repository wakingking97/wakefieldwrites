// One-shot "it worked / it failed" banner for the admin pages.
//
// A Server Action calls setAdminFlash() before it returns or redirects.
// Setting a cookie in a Server Action makes Next re-render the current page
// and its layouts, so the admin layout reads the cookie and hands it to
// <AdminFlashBanner>, which shows it once and then clears the cookie.

import { cookies } from "next/headers";
import { ADMIN_FLASH_COOKIE, type AdminFlash } from "./adminFlashShared";

export async function setAdminFlash(type: AdminFlash["type"], message: string) {
  const value: AdminFlash = { type, message: message.slice(0, 300), id: Date.now() };
  const store = await cookies();
  store.set(ADMIN_FLASH_COOKIE, encodeURIComponent(JSON.stringify(value)), {
    path: "/admin",
    maxAge: 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // The banner clears it from the browser after showing it.
    httpOnly: false,
  });
}
