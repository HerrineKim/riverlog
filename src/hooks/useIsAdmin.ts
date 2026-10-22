"use client";

import { useEffect, useState } from "react";

/** Pages are static, so whether the owner is signed in is only known in the browser. */
export default function useIsAdmin(): boolean {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d) => alive && setAdmin(d.admin === true))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return admin;
}
