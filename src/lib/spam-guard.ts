const MIN_MS = 2500;

export function startedAtNow(): string {
  return String(Date.now());
}

/** True if this looks like a bot. Honeypot filled, or form submitted too fast. */
export function isLikelySpam(form: FormData): boolean {
  const honeypot = String(form.get("company") ?? "").trim();
  if (honeypot) return true;

  const started = Number(form.get("form-started"));
  if (!Number.isFinite(started) || started <= 0) return true;
  if (Date.now() - started < MIN_MS) return true;

  return false;
}
