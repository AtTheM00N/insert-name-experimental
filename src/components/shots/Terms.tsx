"use client";

import { useState } from "react";
import { PRICING_NOTE, TIERS, type Tier } from "@/content/pricing";
import styles from "./Terms.module.css";

/* =========================================================================
   SHOT 05 — THE TERMS
   Pricing, in the open, presented as ticket stubs at a box office. Three
   builds and one add-on. The add-on can be toggled on, and the stubs
   restate their total including it — so the number a visitor leaves with
   is the number they'd actually pay.

   Nothing here says "starting from" and nothing says "contact us".
   ========================================================================= */

export function Terms() {
  const [withSeo, setWithSeo] = useState(false);
  const addon = TIERS.find((t) => t.addon)!;
  const builds = TIERS.filter((t) => !t.addon);

  return (
    <section
      id="terms"
      data-shot="terms"
      className={`shot ${styles.wrap}`}
      aria-labelledby="terms-title"
    >
      <header className={styles.head}>
        <div>
          <span className="mono">Shot 05 — The Terms</span>
          <h2 id="terms-title" className={styles.title} data-rack="">
            Prices,
            <br />
            <span className={styles.titleDim}>out loud.</span>
          </h2>
        </div>

        <div className={styles.headSide}>
          <p className={styles.note} data-rack="">
            {PRICING_NOTE}
          </p>

          {/* The add-on toggle — a real switch, labelled, keyboard-operable. */}
          <div className={styles.toggleRow} data-rack="">
            <button
              type="button"
              role="switch"
              aria-checked={withSeo}
              onClick={() => setWithSeo((v) => !v)}
              className={styles.toggle}
              data-on={withSeo}
              data-cursor="lock"
            >
              <span className={styles.toggleTrack} aria-hidden="true">
                <span className={styles.toggleKnob} />
              </span>
              <span className={styles.toggleLabel}>
                Add search — {addon.currency}
                {addon.price}
              </span>
            </button>
            <span className={styles.toggleHint}>{addon.line}</span>
          </div>
        </div>
      </header>

      <ul className={styles.stubs}>
        {builds.map((tier, i) => (
          <Stub key={tier.id} tier={tier} addon={addon} withSeo={withSeo} index={i} />
        ))}
      </ul>

      {/* ---- the add-on, stated as its own line ---- */}
      <div className={styles.addon} data-rack="" data-on={withSeo}>
        <div className={styles.addonHead}>
          <span className={styles.addonNo}>{addon.no}</span>
          <h3 className={styles.addonTitle}>{addon.name}</h3>
          <span className={styles.addonPrice}>
            {addon.currency}
            {addon.price}
            <span className={styles.addonUnit}>/{addon.unit}</span>
          </span>
        </div>
        <ul className={styles.addonList}>
          {addon.includes.map((inc) => (
            <li key={inc}>{inc}</li>
          ))}
        </ul>
        <p className={styles.addonNote}>{addon.notes}</p>
      </div>

      <div className={styles.smallprint} data-rack="">
        <span className="mono">No small print</span>
        <ul className={styles.smallprintList}>
          <li>Half up front, half on launch.</li>
          <li>You own the files, the code and the accounts. All of them.</li>
          <li>Two rounds of revision are in the price. A third is quoted before it starts.</li>
          <li>If we can&apos;t make something genuinely good for your budget, we&apos;ll say so.</li>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */

function Stub({
  tier,
  addon,
  withSeo,
  index,
}: {
  tier: Tier;
  addon: Tier;
  withSeo: boolean;
  index: number;
}) {
  const total = tier.amount + (withSeo ? addon.amount : 0);

  return (
    <li
      className={styles.stub}
      data-emphasis={tier.emphasis || undefined}
      data-rack=""
      style={{ "--rack-delay": `${index * 70}ms` } as React.CSSProperties}
    >
      {/* Perforated left edge — this is a stub torn from a book. */}
      <span className={styles.perf} aria-hidden="true" />

      <div className={styles.stubTop}>
        <span className={styles.stubNo}>{tier.no}</span>
        <span className={styles.stubSerial}>{tier.serial}</span>
      </div>

      <h3 className={styles.stubName}>{tier.name}</h3>
      <p className={styles.stubLine}>{tier.line}</p>

      <div className={styles.priceRow}>
        <span className={styles.price}>
          <span className={styles.currency}>{tier.currency}</span>
          {tier.price}
        </span>
        <span className={styles.unit}>{tier.unit}</span>
      </div>

      {/* The honest total. Appears only when the add-on is on. */}
      <div className={styles.total} data-on={withSeo} aria-live="polite">
        {withSeo ? (
          <>
            <span className={styles.totalLabel}>With search</span>
            <span className={styles.totalValue}>
              {tier.currency.replace("+", "")}
              {total.toLocaleString("en-IN")}
            </span>
          </>
        ) : null}
      </div>

      <ul className={styles.includes}>
        {tier.includes.map((inc) => (
          <li key={inc}>{inc}</li>
        ))}
      </ul>

      <p className={styles.stubNote}>{tier.notes}</p>

      <a
        href="#invitation"
        className={styles.stubCta}
        data-cursor="lock"
        data-cursor-label="Take it"
      >
        <span>Take this one</span>
        <span aria-hidden="true">↗</span>
      </a>

      {tier.emphasis ? <span className={styles.stamp}>Best value</span> : null}
    </li>
  );
}
