"use client";

import { S1_EMBED_SLOT_CLICK } from "@/lib/s1-embed-protocol";
import type { S1DemoSlotAdjust, SalonxV2AdminConfig, S1DemoSlotId } from "@/lib/salonx-config";
import { getActiveBrand } from "@/lib/salonx-config";
import { S1_FRAME_H, S1_FRAME_W, slotImageTransform } from "@/lib/s1-slot-geometry";
import { salonxThemeInlineVars } from "@/lib/salonx-primary-theme";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import "@/salonx-clone/screen1.css";
import "@/salonx-clone/screen1-admin-preview.css";

/** From `salonx-web-v2/src/component/CurvedLine.jsx` + `public/updated curved line.svg`. */
function CurvedLineClone({ hideBodyFill = false }: { hideBodyFill?: boolean }) {
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
      {hideBodyFill ? null : (
        <path
          d="M27.1884 68.4097C25.2596 65.3435 23.5931 63.4417 21.137 60.7797C17.7833 57.1446 15.7755 55.7623 12.4546 52.0972C-0.966718 37.2853 0.878002 0.791992 0.878002 0.791992H48.7357V117.739L50.2357 511.792C47.9283 497.314 15.3539 387.663 9.73572 358.792C4.11752 329.921 5.3975 331.448 4.75756 313.928C4.09872 295.891 4.16412 285.588 5.96864 267.711C7.61673 251.381 8.9033 242.092 12.2357 226.292C14.593 215.114 15.8912 210.562 17.7357 203.292C26.2357 169.792 58.2357 106.792 27.1884 68.4097Z"
          fill="#000000"
        />
      )}
      <path
        d="M21.7171 60.2444C21.3304 60.6012 20.9436 60.9581 20.5569 61.3149C22.7728 63.6936 24.8381 66.1022 26.5191 68.8307L26.5736 68.907C36.0099 80.3801 39.7799 95.4998 39.6698 110.253C39.3763 140.138 27.5389 168.288 18.7334 196.729C18.0961 198.863 17.492 201 16.9603 203.095C14.9846 210.713 13.049 218.394 11.4529 226.127C8.46825 239.806 6.50323 253.71 5.17275 267.63C3.47968 283.003 3.28908 298.534 3.95826 313.957C3.7932 328.99 5.88224 344.197 8.95076 358.945C20.6824 410.412 37.1378 460.885 49.4469 511.918L51.0345 511.789C50.5335 380.438 50.0318 249.087 49.5296 117.736C49.5289 78.7568 49.5282 39.7744 49.5274 0.791992L49.5275 0.000281572L48.7357 0.000265896C32.7831 0.000582755 16.8306 0.000908792 0.878002 0.00124389L0.126233 0.00122809L0.0882622 0.752071C-0.0625958 4.55184 -0.00895464 8.39977 0.164699 12.2025C1.09043 26.1494 2.47773 41.2196 11.8695 52.6274C14.6379 55.7469 17.8518 58.322 20.5569 61.3149C20.9436 60.9581 21.3304 60.6013 21.7171 60.2444C18.9185 57.1549 15.7144 54.5879 13.0397 51.5671C4.17825 40.8813 2.61808 25.9069 1.74399 12.1286C1.57197 8.37395 1.5206 4.53124 1.66774 0.831913L0.878002 1.58274C16.8306 1.58308 32.7831 1.5834 48.7357 1.58372L47.944 0.791992C47.9432 39.7744 47.9425 78.7568 47.9418 117.739C48.4396 249.093 48.938 380.444 49.437 511.795L51.0245 511.666C38.6436 460.298 22.2127 409.94 10.5207 358.639C7.44735 343.797 5.40532 329.103 5.55686 313.898C4.89003 298.481 5.07827 283.122 6.76454 267.791C8.09572 253.877 10.0418 240.106 13.0185 226.457C14.6125 218.737 16.528 211.136 18.5111 203.489C19.0356 201.422 19.6337 199.305 20.2664 197.187C29.0172 168.876 40.9573 140.59 41.2616 110.254C41.3757 95.2748 37.5213 79.7167 27.8031 67.9124L27.8577 67.9886C26.1224 65.1693 23.9342 62.6205 21.7171 60.2444ZM20.5569 61.3149L21.7171 60.2444L20.5569 61.3149L20.5569 61.3149Z"
        fill="var(--salonx-primary)"
      />
    </svg>
  );
}

const EMBED_SLOT_ARIA: Record<S1DemoSlotId, string> = {
  topBar: "Top bar — upload or adjust image",
  hero: "Hero — upload or adjust image",
  promo: "Promo — upload or adjust image",
  curveStrip: "Curve strip — upload or adjust image or video",
};

function DemoSlotStatic({
  className,
  hintEmpty,
  src,
  adjust,
  slotId,
  interactive = false,
  mediaKind = "image",
}: {
  className: string;
  hintEmpty: string;
  src: string;
  adjust: S1DemoSlotAdjust;
  slotId?: S1DemoSlotId;
  interactive?: boolean;
  mediaKind?: "image" | "video";
}) {
  const transform = slotImageTransform(adjust);
  const cls = [
    "s1demo-slot",
    className,
    src ? "s1demo-slot--committed" : "",
    interactive ? "s1demo-slot--embedInteractive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const imgLayerStyle: CSSProperties = {
    ["--s1-slot-fit" as string]: adjust.fit,
  };

  const notifyParent = (e?: MouseEvent | KeyboardEvent) => {
    if (!interactive || !slotId) return;
    e?.stopPropagation();
    e?.preventDefault();
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage(
        { type: S1_EMBED_SLOT_CLICK, slot: slotId },
        window.location.origin,
      );
    }
  };

  return (
    <div
      className={cls}
      aria-hidden={interactive ? undefined : true}
      aria-label={interactive && slotId ? EMBED_SLOT_ARIA[slotId] : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? (e) => notifyParent(e) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                notifyParent(e);
              }
            }
          : undefined
      }
    >
      {src ? (
        <div className="s1demo-slot__imgLayer" style={imgLayerStyle}>
          {mediaKind === "video" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={src}
              muted
              playsInline
              loop
              autoPlay
              draggable={false}
              style={{ transform }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt=""
              draggable={false}
              style={{ transform }}
            />
          )}
        </div>
      ) : (
        <span className="s1demo-slot__hint">{hintEmpty}</span>
      )}
    </div>
  );
}

const S1_CARD_STACK_GAP_PX = 8;

const waitingContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "flex-start",
  width: "100%",
  boxSizing: "border-box",
  marginTop: 0,
  paddingBottom: "14px",
  gap: S1_CARD_STACK_GAP_PX,
};

const waitingListHeaderStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "6px 14px",
  width: "100%",
  background: "#0a0a0c",
  boxShadow: "0 6px 10px -10px rgba(0, 0, 0, 0.55)",
  boxSizing: "border-box",
};

const innerFlexStyle: CSSProperties = { display: "flex", alignItems: "center" };

const headerCountStyle: CSSProperties = {
  fontSize: "9px",
  fontWeight: 600,
  color: "rgba(245, 245, 247, 0.55)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const clientsContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "0 0 4px",
  boxSizing: "border-box",
  gap: S1_CARD_STACK_GAP_PX,
};

const emptyStyle: CSSProperties = {
  padding: "18px 14px",
  fontSize: "11px",
  color: "rgba(245, 245, 247, 0.5)",
  fontStyle: "italic",
  textAlign: "center",
};

const S1_WAITLIST_INDICATOR_BLUE = "#25AFFF";

function WaitingListStatic() {
  const headerStyles = useMemo(
    () => ({
      indicatorDotStyle: {
        width: "10px",
        height: "10px",
        background: S1_WAITLIST_INDICATOR_BLUE,
        borderRadius: "50%",
        boxShadow: `0 0 8px ${S1_WAITLIST_INDICATOR_BLUE}`,
      } satisfies CSSProperties,
      waitingListHeaderTextStyle: {
        color: S1_WAITLIST_INDICATOR_BLUE,
        fontSize: "0.72rem",
        fontWeight: "bold",
        paddingLeft: "10px",
        margin: 0,
        letterSpacing: "0.04em",
      } satisfies CSSProperties,
    }),
    [],
  );

  return (
    <div style={waitingContainerStyle}>
      <div style={waitingListHeaderStyle}>
        <div style={innerFlexStyle}>
          <div style={headerStyles.indicatorDotStyle} />
          <h1 style={headerStyles.waitingListHeaderTextStyle}>Waiting List</h1>
        </div>
        <span style={headerCountStyle} aria-label="0 entries">
          0
        </span>
      </div>
      <div style={clientsContainerStyle}>
        <div style={emptyStyle}>No parked appointments or waitlist clients</div>
      </div>
    </div>
  );
}

function ClientListStatic() {
  return <div style={{ width: "100%", padding: 0, boxSizing: "border-box" }} />;
}

const dayNumberStyle: CSSProperties = {
  fontWeight: "bold",
  margin: 0,
  cursor: "default",
};

/** Read-only stand-in for `DynamicDate` (no router). */
function DateClone() {
  const [parts, setParts] = useState<{ day: string; num: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      const today = new Date();
      setParts({
        day: today.toLocaleDateString("en-US", { weekday: "short" }),
        num: today.getDate(),
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!parts) {
    return <span style={{ opacity: 0.4 }}>···</span>;
  }
  return (
    <>
      {parts.day}
      <br />
      <p style={dayNumberStyle}>{parts.num}</p>
    </>
  );
}

type CloneProps = {
  config: SalonxV2AdminConfig;
  /**
   * Admin preview: one handset-high frame (omit scroll filler + use definite height
   * so `%` heights and masks align; avoids giant clipped scroll area under `overflow:hidden`).
   */
  embed?: boolean;
};

/**
 * Structural clone of salonx-web-v2 `Screen1DemoImage.jsx` (view-only, no upload).
 * Imports the real `screen1.css` bundle copied from the Vite app.
 */
export function SalonxScreen1DemoClone({ config, embed = false }: CloneProps) {
  const brand = getActiveBrand(config);
  const themeStyle = salonxThemeInlineVars(brand.primaryHex);
  const { images, adjust, mediaKinds } = brand.s1Demo;

  return (
    <div
      className="text-left"
      style={{
        ...themeStyle,
        width: S1_FRAME_W,
        minHeight: S1_FRAME_H,
        ...(embed ? { height: S1_FRAME_H } : {}),
        display: "inline-block",
        verticalAlign: "top",
      }}
    >
      <div
        className="screen1-container screen1-container--demoImage screen1-container--adminPreview"
        style={
          embed
            ? { height: S1_FRAME_H, minHeight: S1_FRAME_H }
            : { height: "100%", minHeight: S1_FRAME_H }
        }
      >
        <div className="date-screen1">
          <DateClone />
        </div>
        <div className="screen1-modal-root" id="v2-admin-screen1-modal-root" />

        <div className="layout-wrapper">
          <div className="screen1-background">
            <div>
              <div
                className="profile-panel s1demo-panelSlot"
                style={{ transform: "translateX(0)" }}
              >
                <div className="s1demo-grayStack">
                  <DemoSlotStatic
                    className="s1demo-grayStack__topBar s1demo-slot--compact"
                    hintEmpty="Tap"
                    src={images.topBar}
                    adjust={adjust.topBar}
                    slotId="topBar"
                    interactive={embed}
                  />
                  <DemoSlotStatic
                    className="s1demo-grayStack__hero"
                    hintEmpty="Tap to add image"
                    src={images.hero}
                    adjust={adjust.hero}
                    slotId="hero"
                    interactive={embed}
                  />
                </div>
              </div>

              {embed ? null : (
                <a
                  href="https://youtu.be/O-6GcaV833c"
                  className="screen1-heroYoutubeLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Danger Jones butterfly — watch on YouTube (opens in new tab)"
                />
              )}
              <DemoSlotStatic
                className="s1demo-grayPromo s1demo-slot--promo"
                hintEmpty="Tap"
                src={images.promo}
                adjust={adjust.promo}
                slotId="promo"
                interactive={embed}
              />
              {embed ? null : (
                <a
                  href="https://youtu.be/HOf_GkkpiKk?si=f75yAuJx_ld6-mHb"
                  className="screen1-promoYoutubeLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Epilogue — watch on YouTube (opens in new tab)"
                />
              )}

              <div
                className="client-list-wrapper client-list"
                style={{ transform: "translateX(0%)" }}
              >
                <ClientListStatic />
                <WaitingListStatic />
              </div>

              <div
                className="timer-panel"
                style={{ transform: "translateX(-100%)" }}
                aria-hidden
              />
            </div>

            <div className="curvedline-container curvedline-container--demoSlot">
              <div className="s1demo-curveStripLayer">
                <DemoSlotStatic
                  className="s1demo-curveStripSlot"
                  hintEmpty="Tap"
                  src={images.curveStrip}
                  adjust={adjust.curveStrip}
                  slotId="curveStrip"
                  interactive={embed}
                  mediaKind={mediaKinds?.curveStrip === "video" ? "video" : "image"}
                />
              </div>
              <CurvedLineClone hideBodyFill={!!images.curveStrip} />
            </div>
          </div>
        </div>

        {embed ? null : <div className="screen1-blackBelow" aria-hidden />}
      </div>
    </div>
  );
}
