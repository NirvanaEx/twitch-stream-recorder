"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Channel management was merged into the dashboard (/admin). This page stays
// only to redirect old links and bookmarks.
export default function ChannelsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return null;
}
