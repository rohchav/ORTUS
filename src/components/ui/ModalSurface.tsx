"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";

interface ModalSurfaceProps {
  open: boolean;
  eyebrow: string;
  title: string;
  closeLabel: string;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}

export function ModalSurface({
  open,
  eyebrow,
  title,
  closeLabel,
  onClose,
  returnFocusRef,
  children,
  className = ""
}: ModalSurfaceProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function requestClose() {
    onClose();
    window.requestAnimationFrame(() => returnFocusRef?.current?.focus());
  }

  return (
    <dialog
      ref={dialogRef}
      className={`world-modal-surface ${className}`.trim()}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
    >
      <div className="world-modal-surface__frame">
        <header className="world-modal-surface__head">
          <div>
            <span>{eyebrow}</span>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={requestClose}>
            {closeLabel}
          </button>
        </header>
        <div
          className="world-modal-surface__body"
          data-intentional-scroll-region="world-modal"
          tabIndex={0}
          aria-label={`${title} content`}
        >
          {children}
        </div>
      </div>
    </dialog>
  );
}
