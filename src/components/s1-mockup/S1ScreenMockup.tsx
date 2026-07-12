"use client";

import { useEffect, useState } from "react";

/** Same paths as `salonx-web-v2` `CurvedLine.jsx` (`public/updated curved line.svg`). */
function CurvedLineMock() {
  return (
    <svg
      className="curvedline-svg"
      width="100%"
      height="100%"
      viewBox="0 0 52 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M27.1884 68.4097C25.2596 65.3435 23.5931 63.4417 21.137 60.7797C17.7833 57.1446 15.7755 55.7623 12.4546 52.0972C-0.966718 37.2853 0.878002 0.791992 0.878002 0.791992H48.7357V117.739L50.2357 511.792C47.9283 497.314 15.3539 387.663 9.73572 358.792C4.11752 329.921 5.3975 331.448 4.75756 313.928C4.09872 295.891 4.16412 285.588 5.96864 267.711C7.61673 251.381 8.9033 242.092 12.2357 226.292C14.593 215.114 15.8912 210.562 17.7357 203.292C26.2357 169.792 58.2357 106.792 27.1884 68.4097Z"
        fill="#000000"
      />
      <path
        d="M21.7171 60.2444C21.3304 60.6012 20.9436 60.9581 20.5569 61.3149C22.7728 63.6936 24.8381 66.1022 26.5191 68.8307L26.5736 68.907C36.0099 80.3801 39.7799 95.4998 39.6698 110.253C39.3763 140.138 27.5389 168.288 18.7334 196.729C18.0961 198.863 17.492 201 16.9603 203.095C14.9846 210.713 13.049 218.394 11.4529 226.127C8.46825 239.806 6.50323 253.71 5.17275 267.63C3.47968 283.003 3.28908 298.534 3.95826 313.957C3.7932 328.99 5.88224 344.197 8.95076 358.945C20.6824 410.412 37.1378 460.885 49.4469 511.918L51.0345 511.789C50.5335 380.438 50.0318 249.087 49.5296 117.736C49.5289 78.7568 49.5282 39.7744 49.5274 0.791992L49.5275 0.000281572L48.7357 0.000265896C32.7831 0.000582755 16.8306 0.000908792 0.878002 0.00124389L0.126233 0.00122809L0.0882622 0.752071C-0.0625958 4.55184 -0.00895464 8.39977 0.164699 12.2025C1.09043 26.1494 2.47773 41.2196 11.8695 52.6274C14.6379 55.7469 17.8518 58.322 20.5569 61.3149C20.9436 60.9581 21.3304 60.6013 21.7171 60.2444C18.9185 57.1549 15.7144 54.5879 13.0397 51.5671C4.17825 40.8813 2.61808 25.9069 1.74399 12.1286C1.57197 8.37395 1.5206 4.53124 1.66774 0.831913L0.878002 1.58274C16.8306 1.58308 32.7831 1.5834 48.7357 1.58372L47.944 0.791992C47.9432 39.7744 47.9425 78.7568 47.9418 117.739C48.4396 249.093 48.938 380.444 49.437 511.795L51.0245 511.666C38.6436 460.298 22.2127 409.94 10.5207 358.639C7.44735 343.797 5.40532 329.103 5.55686 313.898C4.89003 298.481 5.07827 283.122 6.76454 267.791C8.09572 253.877 10.0418 240.106 13.0185 226.457C14.6125 218.737 16.528 211.136 18.5111 203.489C19.0356 201.422 19.6337 199.305 20.2664 197.187C29.0172 168.876 40.9573 140.59 41.2616 110.254C41.3757 95.2748 37.5213 79.7167 27.8031 67.9124L27.8577 67.9886C26.1224 65.1693 23.9342 62.6205 21.7171 60.2444ZM20.5569 61.3149L21.7171 60.2444L20.5569 61.3149L20.5569 61.3149Z"
        fill="var(--salonx-primary)"
      />
    </svg>
  );
}

function IconScissors({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <path d="M216 92a28 28 0 1 1-28-28 28 28 0 0 1 28 28ZM184 128a27.76 27.76 0 0 1-17.09-5.86L128 114.71 89.09 122.14A28 28 0 1 1 80 72.52l43-8.6a12 12 0 0 1 4.7.57l38.91 7.43A28 28 0 1 1 184 128ZM128 176.71l-43 8.6a12 12 0 0 1-4.7-.57L41.39 177.31A28 28 0 1 1 72 204.52l43-8.6a12 12 0 0 1 4.7-.57l38.91-7.43A28 28 0 1 1 128 176.71Z" />
    </svg>
  );
}

function IconUser({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <path d="M230.93 220a12 12 0 0 1-10.93 7H36a12 12 0 0 1-10.93-7 123.69 123.69 0 0 1 20.58-49.48A84.13 84.13 0 0 1 128 136a84.13 84.13 0 0 1 82.35 34.52 123.69 123.69 0 0 1 20.58 49.48ZM128 120a48 48 0 1 0-48-48 48 48 0 0 0 48 48Z" />
    </svg>
  );
}

function IconBolt({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <path d="m213.65 122.35-144-80A12 12 0 0 0 52 54v68a12 12 0 0 0 2.35 7.17L136 212h56a12 12 0 0 0 8.88-19.92L151.87 122l69.78-38.76a12 12 0 0 0 0-21Z" />
    </svg>
  );
}

function IconCalendar({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <path d="M208 36h-28V24a12 12 0 0 0-24 0v12H100V24a12 12 0 0 0-24 0v12H48a20 20 0 0 0-20 20v160a20 20 0 0 0 20 20h160a20 20 0 0 0 20-20V56a20 20 0 0 0-20-20ZM76 204H52a4 4 0 0 1-4-4V100h28Zm56 0H100V100h32Zm56 0h-24V100h28v100a4 4 0 0 1-4 4Z" />
    </svg>
  );
}

function IconGear({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <path d="M128 80a48 48 0 1 0 48 48 48 48 0 0 0-48-48Zm106.79 62.88-9.56 28a19.9 19.9 0 0 1-24.5 12.8l-26.57-9.63a77.57 77.57 0 0 1-8.21 7.08l5.91 27.35a20 20 0 0 1-15.36 23.73l-29.67 6.12A19.88 19.88 0 0 1 117 222.62L108 194a81.2 81.2 0 0 1-10.32 0l-9 28.62a19.88 19.88 0 0 1-19.19 13.93h-4.72a19.9 19.9 0 0 1-19.89-19.29l5.92-27.35a77.57 77.57 0 0 1-8.21-7.08l-26.57 9.63a19.9 19.9 0 0 1-24.5-12.8l-9.56-28A20 20 0 0 1 18 123.47l21.53-19.17a76.48 76.48 0 0 1 0-10.6L18 74.53a20 20 0 0 1-7.79-26.25l9.56-28a19.9 19.9 0 0 1 24.5-12.8l26.57 9.63a77.57 77.57 0 0 1 8.21-7.08l-5.91-27.35a20 20 0 0 1 15.36-23.73l29.67-6.12A19.88 19.88 0 0 1 139 33.38l9 28.62a81.2 81.2 0 0 1 10.32 0l9-28.62A19.88 19.88 0 0 1 177.48 19h4.72a19.9 19.9 0 0 1 19.89 19.29l-5.92 27.35a77.57 77.57 0 0 1 8.21 7.08l26.57-9.63a19.9 19.9 0 0 1 24.5 12.8l9.56 28A20 20 0 0 1 238 132.53l-21.53 19.17a76.48 76.48 0 0 1 0 10.6L238 181.47a20 20 0 0 1 7.79 26.25ZM128 168a40 40 0 1 1 40-40 40 40 0 0 1-40 40Z" />
    </svg>
  );
}

const TOOLBAR = [
  { Icon: IconScissors, label: "Stylist", active: true },
  { Icon: IconUser, label: "Clients", active: false },
  { Icon: IconBolt, label: "Checkout", active: false },
  { Icon: IconCalendar, label: "Calendar", active: false },
  { Icon: IconGear, label: "Settings", active: false },
];

function MockProfileBlock() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        position: "relative",
        width: "360px",
        height: "206px",
        margin: "0 auto",
        borderTopRightRadius: "50px",
        borderBottomRightRadius: "51px",
        padding: "53px 16px 0 16px",
        textAlign: "center",
        isolation: "isolate",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          borderTopRightRadius: "50px",
          borderBottomRightRadius: "51px",
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(5px)",
        }}
      />
      <div className="relative z-[1]" style={{ position: "relative", zIndex: 1 }}>
        <div
          className="mx-auto block rounded-[14px] bg-zinc-700"
          style={{
            width: "190px",
            height: "120px",
          }}
        />
        <p className="mt-2 text-[10px] font-bold text-white/40">Profile · mock</p>
      </div>
    </div>
  );
}

function MockTopStats() {
  return (
    <div
      className="flex items-center justify-center gap-3 opacity-30"
      style={{ width: "100%", height: "100%" }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-full border border-white/20"
          style={{ width: 56, height: 56 }}
        />
      ))}
    </div>
  );
}

function MockCompanyHeader() {
  const grad =
    "linear-gradient(to right, var(--salonx-primary) 0%, rgba(59, 130, 246, 0.8) 18%, rgba(59, 130, 246, 0.4) 45%, transparent 85%)";
  return (
    <div
      style={{
        position: "relative",
        padding: "1.5px",
        background: grad,
        borderRadius: "11.5px",
        width: "100%",
        height: "70px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="flex h-full w-full items-center justify-between rounded-[10px] bg-[#1A1A1A] px-6 text-white"
        style={{ boxSizing: "border-box" }}
      >
        <div className="h-10 w-28 rounded bg-zinc-700" />
        <span className="text-lg text-white/50">+</span>
        <div className="h-10 w-12 rounded bg-zinc-600" />
      </div>
    </div>
  );
}

function MockClientRows() {
  return (
    <div className="flex flex-col gap-2 px-1 py-2">
      {["Client A", "Client B", "Waiting · 1", "Needs attention"].map((label) => (
        <div
          key={label}
          className="rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-3"
        >
          <div className="h-3 w-24 rounded bg-zinc-600" />
          <div className="mt-2 h-2 w-40 rounded bg-zinc-700" />
        </div>
      ))}
    </div>
  );
}

/**
 * Static structural copy of salonx-web-v2 `Screen1.jsx` (393×852, masks, toolbar, curve).
 */
export function S1ScreenMockup() {
  const [dateLabel, setDateLabel] = useState("…");

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setDateLabel(
        new Date().toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="s1-mockup-scope inline-block text-left">
      <div className="screen1-container">
        <div className="date-screen1">{dateLabel}</div>
        <div id="screen1-modal-root" className="screen1-modal-root" />

        <div className="layout-wrapper">
          <div className="screen1-background">
            <div>
              <div className="profile-panel">
                <MockProfileBlock />
              </div>

              <div className="topstats-panel">
                <MockTopStats />
              </div>

              <div className="company-header">
                <MockCompanyHeader />
              </div>

              <div className="client-list-wrapper client-list">
                <MockClientRows />
              </div>

              <div
                className="timer-panel"
                style={{ transform: "translateX(-100%)" }}
                aria-hidden
              />

              <div className="screen1-toolbar" role="toolbar" aria-label="Screen toolbar">
                {TOOLBAR.map(({ Icon, label, active }) => (
                  <button
                    key={label}
                    type="button"
                    className={`screen1-toolbar__btn${active ? " screen1-toolbar__btn--solid" : ""}`}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    disabled
                  >
                    <Icon size={active ? 26 : 24} />
                  </button>
                ))}
              </div>
            </div>

            <div className="curvedline-container" aria-hidden>
              <CurvedLineMock />
            </div>
          </div>
        </div>

        <div className="screen1-blackBelow" aria-hidden />
      </div>
    </div>
  );
}
