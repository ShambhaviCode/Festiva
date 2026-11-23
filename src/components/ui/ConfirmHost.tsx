"use client";

import { useEffect, useRef, useState } from "react";
import { Overlay } from "@/components/ui/Overlay";
import type { ConfirmRequest } from "@/lib/confirm";

/** Shows confirmAction() requests as a FESTIVA dialog (a bottom sheet on phones). Mounted once in the root layout. */
export function ConfirmHost() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const answer = useRef<boolean>(false);

  useEffect(() => {
    const onConfirm = (e: Event) => {
      e.preventDefault(); // tells confirmAction() that a host is showing it
      const next = (e as CustomEvent<ConfirmRequest>).detail;
      setRequest((current) => {
        current?.resolve(false); // a newer request replaces an unanswered one
        return next;
      });
    };
    window.addEventListener("festiva:confirm", onConfirm);
    return () => window.removeEventListener("festiva:confirm", onConfirm);
  }, []);

  if (!request) return null;
  const danger = request.tone === "danger";
  return (
    <Overlay
      key={request.id}
      role="alertdialog"
      title={request.title}
      description={request.body}
      testId="confirm-dialog"
      // Destructive actions start on Cancel, so Enter never deletes by accident.
      initialFocus={danger ? "[data-cancel]" : "[data-confirm]"}
      onClose={() => {
        request.resolve(answer.current);
        answer.current = false;
        setRequest(null);
      }}
      footer={(close) => (
        <>
          <button type="button" data-cancel className="btn btn-line btn-sm" onClick={() => { answer.current = false; close(); }}>
            {request.cancelLabel ?? "Cancel"}
          </button>
          <button type="button" data-confirm className={`btn btn-sm ${danger ? "btn-danger" : "btn-plum"}`} onClick={() => { answer.current = true; close(); }}>
            {request.confirmLabel ?? "Confirm"}
          </button>
        </>
      )}
    />
  );
}
