import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ROLES, can, type Permission, type Role } from "@/lib/head-data";

type Session = {
  role: Role;
  roleLabel: string;
  name: string;
  scopedCafeId: string | null;
  setRole: (r: Role) => void;
  can: (p: Permission) => boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
};

const Ctx = createContext<Session | null>(null);

const NAMES: Record<Role, string> = {
  platform_owner: "Arjun Kulkarni",
  operations_manager: "Priya Deshmukh",
  support_agent: "Dan Fernandes",
  cafe_owner: "Cafe Owner",
  auditor: "Ravi Balan",
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("platform_owner");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value: Session = {
    role,
    roleLabel: ROLES.find((r) => r.id === role)!.label,
    name: NAMES[role],
    // Cafe-owner scoping is resolved by the pages themselves against live data;
    // there is no single "my cafe" record to hardcode here anymore.
    scopedCafeId: null,
    setRole,
    can: (p) => can(role, p),
    theme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
