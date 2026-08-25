"use client";

import { useMemo, useState } from "react";
import { useExperience } from "@/lib/experience";
import { STUDIO } from "@/content/studio";
import { TIERS } from "@/content/pricing";
import { Kinetic } from "@/components/ui/Kinetic";
import styles from "./Invitation.module.css";

/* =========================================================================
   SHOT 06 — THE INVITATION
   The last frame. Not "get in touch" — a slate for a film that hasn't been
   shot yet, with the visitor's name on it.

   The form is deliberately not a fake API call. It composes a real, complete
   email in the visitor's own client, so the thing they press actually does
   what it says. There is also a copy-address button for people who live in
   webmail. Nothing is submitted anywhere, nothing is stored, and the site
   makes no claim otherwise.
   ========================================================================= */

const INTENTS = [
  { id: "web", label: "A website" },
  { id: "ad", label: "A film" },
  { id: "double", label: "Both" },
  { id: "seo", label: "Search" },
  { id: "unsure", label: "Not sure yet" },
] as const;

export function Invitation() {
  const { studioName, isNamed } = useExperience();
  const [business, setBusiness] = useState("");
  const [intent, setIntent] = useState<string>("unsure");
  const [detail, setDetail] = useState("");
  const [copied, setCopied] = useState(false);

  const mailto = useMemo(() => {
    const tier = TIERS.find((t) => t.id === intent);
    const chosen = INTENTS.find((i) => i.id === intent)?.label ?? "Not sure yet";

    const subject = business
      ? `${business} — ${chosen}`
      : `New project — ${chosen}`;

    const lines = [
      business ? `Business: ${business}` : "Business: (not said yet)",
      `Looking for: ${chosen}`,
      tier ? `From the terms sheet: ${tier.name} — ${tier.currency}${tier.price}` : null,
      "",
      detail || "What we're trying to do:",
      "",
      "—",
      `Sent from ${STUDIO.placeholder.toLowerCase().replace("_", "-")}.com`,
    ].filter(Boolean);

    return `mailto:${STUDIO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      lines.join("\n"),
    )}`;
  }, [business, intent, detail]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(STUDIO.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="invitation"
      data-shot="invitation"
      className={`shot ${styles.wrap}`}
      aria-labelledby="invitation-title"
    >
      <div className={styles.grid}>
        {/* ---------- the slate ---------- */}
        <div className={styles.slate} data-rack="">
          <div className={styles.slateBars} aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={styles.slateBar} data-odd={i % 2 === 1} />
            ))}
          </div>

          <dl className={styles.slateRows}>
            <div className={styles.slateRow}>
              <dt>Production</dt>
              <dd className={styles.slateStrong}>{isNamed ? studioName : STUDIO.placeholder}</dd>
            </div>
            <div className={styles.slateRow}>
              <dt>Scene</dt>
              <dd>{business ? business.toUpperCase() : "———"}</dd>
            </div>
            <div className={styles.slateRow}>
              <dt>Shot</dt>
              <dd>{INTENTS.find((i) => i.id === intent)?.label ?? "———"}</dd>
            </div>
            <div className={styles.slateRow}>
              <dt>Take</dt>
              <dd>01</dd>
            </div>
            <div className={styles.slateRow}>
              <dt>Director</dt>
              <dd>You</dd>
            </div>
          </dl>

          <div className={styles.slateBars} data-flip aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={styles.slateBar} data-odd={i % 2 === 0} />
            ))}
          </div>
        </div>

        {/* ---------- the words ---------- */}
        <div className={styles.body}>
          <span className="mono">Shot 06 — The Invitation</span>

          <h2 id="invitation-title" className={styles.title}>
            <Kinetic text="THE REEL IS" mode="wipe" delay={0} stagger={24} />
            <Kinetic
              text="STILL RUNNING."
              mode="wipe"
              delay={280}
              stagger={24}
              emphasis="RUNNING"
              className={styles.titleTwo}
            />
          </h2>

          <p className={styles.lede} data-rack="">
            Frame 07 is empty and we would like your name on it. Tell us what the business is
            and what it&apos;s for. You&apos;ll get a real person, a real opinion, and a price
            from the sheet you just read — not a discovery call.
          </p>

          {/* ---------- the composer ---------- */}
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = mailto;
            }}
          >
            <div className={styles.field}>
              <label htmlFor="inv-business" className={styles.label}>
                The business
              </label>
              <input
                id="inv-business"
                name="business"
                type="text"
                autoComplete="organization"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="What it's called"
                className={styles.input}
                maxLength={80}
              />
            </div>

            <fieldset className={styles.fieldset}>
              <legend className={styles.label}>What it needs</legend>
              <div className={styles.chips}>
                {INTENTS.map((i) => (
                  <label key={i.id} className={styles.chip} data-on={intent === i.id}>
                    <input
                      type="radio"
                      name="intent"
                      value={i.id}
                      checked={intent === i.id}
                      onChange={() => setIntent(i.id)}
                      className={styles.chipInput}
                    />
                    <span>{i.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={styles.field}>
              <label htmlFor="inv-detail" className={styles.label}>
                The one thing that matters most
              </label>
              <textarea
                id="inv-detail"
                name="detail"
                rows={3}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Optional. One sentence is plenty."
                className={styles.textarea}
                maxLength={600}
              />
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.send} data-cursor="lock" data-cursor-label="Open mail">
                <span className={styles.sendMark} aria-hidden="true">
                  ⦿
                </span>
                <span>Roll camera</span>
                <span className={styles.sendArrow} aria-hidden="true">
                  ↗
                </span>
              </button>

              <button type="button" onClick={copy} className={styles.copy} data-cursor="lock">
                {copied ? "Address copied" : STUDIO.email}
              </button>
            </div>

            <p className={styles.formNote}>
              This opens your own mail app with everything already filled in. Nothing is sent
              to us, or to anybody else, until you press send.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
