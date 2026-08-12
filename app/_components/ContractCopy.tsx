"use client";

import { useEffect, useRef, useState } from "react";
import { dispatchPatternAnalytics } from "../_lib/analytics";
import {
  contractCopyAnalyticsEvent,
  copyExactContract,
} from "../verify/contractCopyModel.mjs";

type CopyState = "idle" | "copied" | "failed";

type ContractCopyProps = Readonly<{
  address: string;
}>;

const COPY_MESSAGES: Record<CopyState, string> = {
  idle: "",
  copied: "Full contract address copied.",
  failed:
    "Automatic copy failed. The full address is selected below; copy it manually.",
};

export function ContractCopy({ address }: ContractCopyProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const manualField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (copyState !== "failed") return;

    manualField.current?.focus();
    manualField.current?.select();
  }, [copyState]);

  async function handleCopy() {
    const result = (await copyExactContract(address, navigator.clipboard)) as {
      state: "copied" | "failed";
    };
    setCopyState(result.state);

    const analyticsEvent = contractCopyAnalyticsEvent(result);
    if (analyticsEvent) dispatchPatternAnalytics(analyticsEvent);
  }

  return (
    <div className="contract-copy" data-copy-state={copyState}>
      <button
        className="contract-copy__button"
        onClick={handleCopy}
        type="button"
      >
        <span>{copyState === "copied" ? "FULL CA COPIED" : "COPY FULL CA"}</span>
        <span aria-hidden="true">{copyState === "copied" ? "✓" : "↗"}</span>
      </button>

      <p className="contract-copy__status" aria-live="polite" aria-atomic="true">
        {COPY_MESSAGES[copyState]}
      </p>

      {copyState === "failed" ? (
        <div className="contract-copy__fallback">
          <label htmlFor="manual-contract-address">MANUAL COPY / FULL ADDRESS</label>
          <input
            id="manual-contract-address"
            onFocus={(event) => event.currentTarget.select()}
            readOnly
            ref={manualField}
            type="text"
            value={address}
          />
        </div>
      ) : null}
    </div>
  );
}
