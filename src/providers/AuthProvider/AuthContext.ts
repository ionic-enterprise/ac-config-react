import { AuthResult, ProviderOptions } from "@ionic-enterprise/auth";
import { Flow, Provider } from "../../util/auth-config";
import { createContext, useContext } from "react";

export interface Context {
  isSetup: boolean;
  flow?: Flow;
  options?: ProviderOptions;
  provider?: Provider;
  session?: AuthResult;
  updateAuthConfig: (
    options: ProviderOptions,
    provider: Provider,
    flow?: Flow,
  ) => Promise<void>;
  canRefresh: () => Promise<boolean>;
  isExpired: () => Promise<boolean>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<Context | undefined>(undefined);

export const useAuth = (): Context => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
};
