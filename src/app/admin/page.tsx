"use client";

import Link from "next/link";
import { AdminFrame } from "@/components/admin/AdminFrame";

export default function AdminHome() {
  return (
    <AdminFrame<unknown> endpoint="/api/admin/integrations">
      {() => (
        <div>
          <h1 className="display-1">FESTIVA administration</h1>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            <li className="rule rounded-xl border p-6">
              <Link href="/admin/integrations" className="display-3 link">
                Integrations
              </Link>
              <p className="mt-2">Sarvam, Flagsmith and NudgeBee: what is configured, what has actually worked, connection tests, feature flags and the onboarding experiment.</p>
            </li>
            <li className="rule rounded-xl border p-6">
              <Link href="/admin/operations" className="display-3 link">
                Operations
              </Link>
              <p className="mt-2">Live telemetry, alerts, NudgeBee delivery, runbooks waiting for approval, controlled tests and the audit trail.</p>
            </li>
          </ul>
        </div>
      )}
    </AdminFrame>
  );
}
