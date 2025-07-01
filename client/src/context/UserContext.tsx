import { createContext, useContext } from "react";
import type { User } from "@/hooks/use-auth";

export const UserContext = createContext<User | null>(null);

export function useUser() {
  return useContext(UserContext);
}