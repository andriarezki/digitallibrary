import { User } from "@/hooks/use-auth";

export function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem("library_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem("library_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("library_user");
  }
}
