"use client";

import { useRef, useState } from "react";
import { Plate } from "@/components/ui/Plate";
import { PALETTE, type RGB } from "@/lib/plate";
import { useExperience } from "@/lib/experience";
import { SERVICES } from "@/content/services";
import styles from "./Lenses.module.css";

/* =========================================================================
   SHOT 04 — THE LENSES
   Three services, presented as three lenses in a case. Choosing one racks
   the whole panel over: the plate changes, the claim changes, the frame
   number changes. Only one is open at a time, which is the point — these
   are different ways of pointing a camera at the same business, not a
   pricing table with feature ticks.

   Implemented as a real tablist: arrow keys move between lenses, Home/End
   jump to the ends, and each panel is properly associated with its tab.
   ========================================================================= */

const TEXTURE: Record<string, "flow" | "scan" | "grid"> = {
  websites: "flow",
  ads: "scan",
  search: "grid",
};

const HI: Record<string, RGB> = {
  websites: PALETTE.signal,
  ads: PALETTE.alert,
  search: PALETTE.bone,
};

export function Lenses() {
  const { reducedMotion } = useExperience();
  const [active, setActive] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const hoverRef = useRef(0);

  const service = SERVICES[active]!;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = SERVICES.length - 1;
    let next = active;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <section
      id="lenses"
      data-shot="lenses"
      className={`shot ${styles.wrap}`}
      aria-labelledby="lenses-title"
    >
      <header className={styles.head}>
        <span className="mono">Shot 04 — The Lenses</span>
        <h2 id="lenses-title" className={styles.title} data-rack="">
          Three ways
          <br />
          <span className={styles.titleDim}>to make people look.</span>
        </h2>
      </header>

      <div className={styles.case}>
        {/* ---- the lens selector ---- */}
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Services"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
        >
          {SERVICES.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`lens-tab-${s.id}`}
                aria-selected={on}
                aria-controls={`lens-panel-${s.id}`}
                tabIndex={on ? 0 : -1}
                className={styles.tab}
                data-on={on}
                data-signal={s.signal}
                onClick={() => setActive(i)}
                data-cursor="lock"
              >
                <span className={styles.tabNo}>{s.no}</span>
                <span className={styles.tabBody}>
                  <span className={styles.tabDept}>{s.dept}</span>
                  <span className={styles.tabTitle}>{s.title}</span>
                </span>
                <span className={styles.tabRing} aria-hidden="true">
                  <span className={styles.tabRingInner} />
                </span>
              </button>
            );
          })}
        </div>

        {/* ---- the view through it ---- */}
        <div
          className={styles.panel}
          role="tabpanel"
          id={`lens-panel-${service.id}`}
          aria-labelledby={`lens-tab-${service.id}`}
          tabIndex={0}
          key={service.id}
          data-signal={service.signal}
          onPointerEnter={() => {
            hoverRef.current = 1;
          }}
          onPointerLeave={() => {
            hoverRef.current = 0;
          }}
        >
          <div className={styles.panelPlate}>
            <Plate
              kind={TEXTURE[service.id] ?? "flow"}
              seed={`lens-${service.id}`}
              hi={HI[service.id] ?? PALETTE.bone}
              lo={PALETTE.dim}
              chunk={9}
              live={!reducedMotion}
              intensityRef={hoverRef}
              className={styles.plate}
            />
            <span className={styles.panelFrameNo} aria-hidden="true">
              {service.no}
            </span>
          </div>

          <div className={styles.panelBody}>
            <p className={styles.claim}>{service.claim}</p>
            <p className={styles.copy}>{service.body}</p>

            <div className={styles.meta}>
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Delivered</span>
                <ul className={styles.deliverables}>
                  {service.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Typical window</span>
                <span className={styles.window}>{service.window}</span>
                <a href="#terms" className={styles.panelLink} data-cursor="lock">
                  See what it costs <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
