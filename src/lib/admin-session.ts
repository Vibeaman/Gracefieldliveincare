const UNLOCK_KEY = "gracefield-admin-unlocked";
const PASSCODE_KEY = "gracefield-admin-passcode";

export function isAdminUnlocked(): boolean {
  return window.sessionStorage.getItem(UNLOCK_KEY) === "yes";
}

export function getAdminPasscode(): string {
  return window.sessionStorage.getItem(PASSCODE_KEY) ?? "";
}

export function unlockAdmin(passcode: string): void {
  window.sessionStorage.setItem(UNLOCK_KEY, "yes");
  window.sessionStorage.setItem(PASSCODE_KEY, passcode);
}

export function lockAdmin(): void {
  window.sessionStorage.removeItem(UNLOCK_KEY);
  window.sessionStorage.removeItem(PASSCODE_KEY);
}
