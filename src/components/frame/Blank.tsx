"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_NAME, useExperience } from "@/lib/experience";
import { useLockBody } from "@/lib/hooks";
import { toStudioName } from "@/lib/utils";
import styles from "./Blank.module.css";

/* =========================================================================
   THE BLANK — the secret.
   The studio is called INSERT_NAME. That is a placeholder nobody replaced,
   and the whole site is built on the idea that a business shouldn't accept
   a placeholder. So the reward for being curious is being handed the pen:
   fill in the blank, and the studio takes your name for the rest of the
   visit — letterbox, slate, boot leader, everything.

   Three ways in, all discoverable, none advertised:
     · click the underscore in the mark (it's the only character that moves)
     · type the word "name" anywhere
     · press /
   It persists in localStorage, and there is always a way back.
   ========================================================================= */

const SEQUENCE = "name";

export function Blank() {
  const { studioName, isNamed, setStudioName, resetStudioName, mounted } = useExperience();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const buffer = useRef("");

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setDraft(isNamed ? studioName : "");
    setOpen(true);
  }, [isNamed, studioName]);

  const hide = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus?.();
  }, []);

  /* ---- keyboard routes in ---- */
  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (open) {
        if (e.key === "Escape") hide();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "/") {
        e.preventDefault();
        show();
        return;
      }

      // Rolling buffer — type the word and the blank opens itself.
      if (e.key.length === 1) {
        buffer.current = (buffer.current + e.key.toLowerCase()).slice(-SEQUENCE.length);
        if (buffer.current === SEQUENCE) {
          buffer.current = "";
          show();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, open, show, hide]);

  /* Listen for the mark being clicked, wherever it lives. */
  useEffect(() => {
    if (!mounted) return;
    const onOpen = () => show();
    window.addEventListener("insert-name:blank", onOpen);
    return () => window.removeEventListener("insert-name:blank", onOpen);
  }, [mounted, show]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useLockBody(open);

  /* Focus trap — the dialog keeps the tab ring inside itself. */
  const onKeyDownDialog = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const nodes = e.currentTarget.querySelectorAll<HTMLElement>(
      "button, input, [href], [tabindex]:not([tabindex='-1'])",
    );
    if (!nodes.length) return;
    const first = nodes[0]!;
    const last = nodes[nodes.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const commit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = toStudioName(draft);
    if (!next) return;
    setStudioName(next);
    setFlash(true);
    window.setTimeout(() => {
      setFlash(false);
      hide();
    }, 1150);
  };

  if (!mounted) return null;

  return (
    <>
      {/* A very quiet hint, bottom-left, only after a while, never a popup. */}
      <Hint onOpen={show} hidden={open || isNamed} />

      {open ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="blank-title">
          <button type="button" className={styles.scrim} onClick={hide} aria-label="Close" />

          <div className={styles.panel} onKeyDown={onKeyDownDialog} data-flash={flash}>
            <div className={styles.head}>
              <span className="mono">Found it</span>
              <button type="button" className={styles.close} onClick={hide} data-cursor="lock">
                Close <span aria-hidden="true">×</span>
              </button>
            </div>

            <h2 id="blank-title" className={styles.title}>
              Nobody
              <br />
              filled in
              <br />
              <span className={styles.titleAccent}>the blank.</span>
            </h2>

            <p className={styles.copy}>
              We never named the studio. {DEFAULT_NAME} is the placeholder every template ships
              with, and leaving it there is the whole argument: a placeholder is what you get
              when nobody decides anything.
            </p>
            <p className={styles.copyDim}>
              So decide. Type a name and it becomes ours for the rest of your visit — every
              slate, every bar, the countdown, all of it.
            </p>

            <form onSubmit={commit} className={styles.form}>
              <label htmlFor="blank-input" className={styles.label}>
                The studio&apos;s name
              </label>
              <div className={styles.inputRow}>
                <span className={styles.bracket} aria-hidden="true">
                  [
                </span>
                <input
                  ref={inputRef}
                  id="blank-input"
                  className={styles.input}
                  value={draft}
                  onChange={(e) => setDraft(toStudioName(e.target.value))}
                  placeholder="INSERT_NAME"
                  maxLength={18}
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="blank-help"
                />
                <span className={`${styles.bracket} blink`} aria-hidden="true">
                  ]
                </span>
              </div>
              <p id="blank-help" className={styles.help}>
                Up to 18 characters. Spaces become underscores, the way they should have all
                along.
              </p>

              <div className={styles.actions}>
                <button type="submit" className={styles.commit} disabled={!draft} data-cursor="lock">
                  Name it
                </button>
                {isNamed ? (
                  <button
                    type="button"
                    className={styles.revert}
                    onClick={() => {
                      resetStudioName();
                      setDraft("");
                    }}
                    data-cursor="lock"
                  >
                    Put the blank back
                  </button>
                ) : null}
              </div>
            </form>

            {flash ? (
              <p className={styles.flash} role="status">
                Rewriting the film — {toStudioName(draft)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------
   The hint. Appears once, low and quiet, after the visitor has actually
   travelled — never on arrival, never as a modal, and it remembers being
   dismissed.
   ------------------------------------------------------------------------- */

const HINT_KEY = "insert_name.hint";

const hintWasDismissed = () => {
  try {
    return window.localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false; /* private mode — offer it again, quietly */
  }
};

function Hint({ onOpen, hidden }: { onOpen: () => void; hidden: boolean }) {
  const [show, setShow] = useState(false);
  /* Safe as an initialiser rather than an effect: <Blank> renders nothing
     until `mounted`, so this component only ever mounts on the client and
     there is no server value to disagree with. */
  const [dismissed, setDismissed] = useState(hintWasDismissed);

  useEffect(() => {
    if (dismissed || hidden) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max > 0 && doc.scrollTop / max > 0.55) {
        setShow(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed, hidden]);

  const close = () => {
    setShow(false);
    setDismissed(true);
    try {
      window.localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* no-op */
    }
  };

  if (dismissed || hidden || !show) return null;

  return (
    <aside className={styles.hint}>
      <span className={styles.hintDot} aria-hidden="true" />
      <p className={styles.hintCopy}>
        The underscore in our name isn&apos;t decoration.{" "}
        <button
          type="button"
          className={styles.hintLink}
          onClick={() => {
            close();
            onOpen();
          }}
          data-cursor="lock"
        >
          Press <kbd className={styles.kbd}>/</kbd>
        </button>
      </p>
      <button type="button" onClick={close} className={styles.hintClose} aria-label="Dismiss hint">
        ×
      </button>
    </aside>
  );
}
