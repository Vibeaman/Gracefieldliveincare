import { startedAtNow } from "@/lib/spam-guard";

/** Hidden fields. People never see these; bots often fill them. */
export function HoneypotFields() {
  return (
    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
      <label htmlFor="company">Company</label>
      <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="form-started" value={startedAtNow()} />
    </div>
  );
}
