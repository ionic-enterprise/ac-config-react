import { Capacitor } from "@capacitor/core";
import {
  AuthProvider as ACAuthProvider,
  Auth0Provider,
  AuthConnect,
  AuthConnectConfig,
  AuthResult,
  AzureProvider,
  CognitoProvider,
  OktaProvider,
  OneLoginProvider,
  ProviderOptions,
} from "@ionic-enterprise/auth";
import { IonSpinner } from "@ionic/react";
import { ReactNode, useEffect, useState } from "react";
import {
  Flow,
  Provider,
  awsConfig,
  flows,
  providers,
  webConfig,
} from "../../util/auth-config";
import {
  clearAuthResult,
  getAuthResult,
  getFlow,
  getProvider,
  getProviderOptions,
  storeAuthResult,
  storeConfig,
} from "../../util/auth-store";
import { AuthContext } from "./AuthContext";

interface Props {
  children?: ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const [authProvider, setAuthProvider] = useState<
    ACAuthProvider | undefined
  >();
  const [options, setOptions] = useState<ProviderOptions | undefined>(
    undefined,
  );
  const [flow, setFlow] = useState<Flow | undefined>(undefined);
  const [provider, setProvider] = useState<Provider | undefined>(undefined);
  const [session, setSession] = useState<AuthResult | undefined>(undefined);
  const [isSetup, setIsSetup] = useState<boolean>(false);

  const updateAuthConfig = async (
    options: ProviderOptions,
    provider: Provider,
    flow?: Flow,
  ): Promise<void> => {
    setOptions(options);
    setProvider(provider);
    setFlow(flow);
    await storeConfig(provider, options, flow);
  };

  useEffect(() => {
    const performSetup = async (): Promise<void> => {
      setSession(await getAuthResult());
      setProvider(
        (await getProvider()) || providers.find((p) => p.key === "cognito"),
      );
      setFlow((await getFlow()) || flows.find((f) => f.key === "PKCE"));
      setOptions(
        (await getProviderOptions()) || {
          ...awsConfig,
          ...(Capacitor.isNativePlatform() ? {} : webConfig),
        },
      );
    };

    performSetup();
  }, []);

  useEffect(() => {
    const createAuthProvider = (): void => {
      switch (provider?.key) {
        case "auth0":
          setAuthProvider(new Auth0Provider());
          break;

        case "azure":
          setAuthProvider(new AzureProvider());
          break;

        case "cognito":
          setAuthProvider(new CognitoProvider());
          break;

        case "okta":
          setAuthProvider(new OktaProvider());
          break;

        case "onelogin":
          setAuthProvider(new OneLoginProvider());
          break;

        default:
          console.error("a provider was not set, defaulting to AWS");
          setAuthProvider(new CognitoProvider());
          break;
      }
    };

    if (provider && options && (Capacitor.isNativePlatform() || flow)) {
      createAuthProvider();
    }
  }, [flow, provider, options]);

  useEffect(() => {
    const setupAuthConnect = async (): Promise<void> => {
      const cfg: AuthConnectConfig = {
        logLevel: "DEBUG",
        platform: Capacitor.isNativePlatform() ? "capacitor" : "web",
        ios: {
          webView: "private",
        },
        web: {
          uiMode: "popup",
          authFlow: flow ? flow.key : "implicit",
        },
      };

      await AuthConnect.setup(cfg);
    };

    if (authProvider) {
      setupAuthConnect().then(() => setIsSetup(true));
    }
  }, [authProvider, flow]);

  const login = async (): Promise<void> => {
    if (authProvider && options) {
      const authResult = await AuthConnect.login(authProvider, options);
      setSession(authResult);
      await storeAuthResult(authResult);
    }
  };

  const logout = async (): Promise<void> => {
    if (authProvider && session) {
      await AuthConnect.logout(authProvider, session);
      setSession(undefined);
      await clearAuthResult();
    }
  };

  const canRefresh = async (): Promise<boolean> => {
    if (session) {
      return AuthConnect.isRefreshTokenAvailable(session);
    }
    return false;
  };

  const isExpired = async (): Promise<boolean> => {
    if (session) {
      return AuthConnect.isAccessTokenExpired(session);
    }
    return false;
  };

  const refresh = async (): Promise<void> => {
    if (session && authProvider) {
      const authResult = await AuthConnect.refreshSession(
        authProvider,
        session,
      );
      setSession(authResult);
      if (authResult) {
        storeAuthResult(authResult);
      } else {
        clearAuthResult();
        throw new Error("The refresh failed, you are no longer logged in");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isSetup,
        flow,
        options,
        provider,
        session,
        canRefresh,
        isExpired,
        login,
        logout,
        refresh,
        updateAuthConfig,
      }}
    >
      {isSetup ? children : <IonSpinner />}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
