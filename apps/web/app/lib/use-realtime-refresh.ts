"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

type RefreshCallback = () => void | Promise<void>;

function getSocketBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_WS_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function useRealtimeRefresh(onRefresh: RefreshCallback) {
  useEffect(() => {
    const baseUrl = getSocketBaseUrl();

    if (!baseUrl) {
      return undefined;
    }

    const socket = io(baseUrl, {
      transports: ["websocket"],
      reconnection: true,
    });

    const refresh = () => {
      void onRefresh();
    };

    socket.on("system:hello", refresh);
    socket.on("channel:updated", refresh);
    socket.on("recording:started", refresh);
    socket.on("recording:stopped", refresh);
    socket.on("telegram:updated", refresh);

    return () => {
      socket.off("system:hello", refresh);
      socket.off("channel:updated", refresh);
      socket.off("recording:started", refresh);
      socket.off("recording:stopped", refresh);
      socket.off("telegram:updated", refresh);
      socket.close();
    };
  }, [onRefresh]);
}
