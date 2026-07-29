"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Seedsy sets only strictly-necessary cookies (Supabase auth session), so this
// is an informational notice rather than a consent gate. If analytics or any
// non-essential cookies are ever added, they must be gated behind an
// accept/decline choice here.
export default function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem("seedsy-cookie-notice") !== "seen");
  }, []);

  // Never brand customers' hosted blogs with our notice.
  if (pathname.startsWith("/b/") || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-parchment/15 bg-pine/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-parchment/85">
          Seedsy uses only essential cookies — the ones that keep you signed in.
          No tracking, no ads.{" "}
          <Link href="/privacy" className="text-signal underline decoration-signal/40 underline-offset-2">
            Privacy &amp; cookies
          </Link>
        </p>
        <button
          className="btn shrink-0 !px-5 !py-2"
          onClick={() => {
            localStorage.setItem("seedsy-cookie-notice", "seen");
            setVisible(false);
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
