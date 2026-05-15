"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";

const CALENDAR_EVENTS = [
  "appointment:created",
  "appointment:updated",
  "appointment:deleted",
  "calendar-toolbar:updated",
  "clients-catalog:updated",
  "service-catalog:updated",
] as const;

const REFRESH_DEBOUNCE_MS = 500;
const POLL_FALLBACK_MS = 12_000;

/**
 * Subscribes to demo-api Socket.IO calendar events and refreshes the RSC page.
 * Falls back to slow polling when the socket is down.
 */
export function useCalendarDashboardRealtime(apiOrigin: string | undefined) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!apiOrigin) return;

    const scheduleRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => router.refresh(), REFRESH_DEBOUNCE_MS);
    };

    let socket: Socket | null = null;
    try {
      socket = io(apiOrigin, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 8,
      });
      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));
      for (const ev of CALENDAR_EVENTS) {
        socket.on(ev, scheduleRefresh);
      }
    } catch {
      setConnected(false);
    }

    const pollId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (socket?.connected) return;
      scheduleRefresh();
    }, POLL_FALLBACK_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      clearInterval(pollId);
      document.removeEventListener("visibilitychange", onVisible);
      socket?.disconnect();
      setConnected(false);
    };
  }, [apiOrigin, router]);

  return { connected };
}
