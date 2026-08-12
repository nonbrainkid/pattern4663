export async function copyExactContract(address, clipboard) {
  if (!clipboard || typeof clipboard.writeText !== "function") {
    return { state: "failed", error: "unavailable" };
  }

  try {
    await clipboard.writeText(address);
    return { state: "copied", error: null };
  } catch {
    return { state: "failed", error: "denied" };
  }
}

export function contractCopyAnalyticsEvent(result) {
  return result?.state === "copied"
    ? Object.freeze({ event: "contract_copy" })
    : null;
}
