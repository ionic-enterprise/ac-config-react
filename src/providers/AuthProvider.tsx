import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { IonSpinner, isPlatform } from "@ionic/react";
import { AuthResult, ProviderOptions } from "@ionic-enterprise/auth";
import {
  Flow,
  Provider,
  awsConfig,
  flows,
  providers,
  webConfig,
} from "../util/auth-config";
import {
  getFlow,
  getProvider,
  getProviderOptions,
  storeConfig,
} from "../util/auth-store";

// NOTE: This is currently just a stub to get us off and running.

type Props = { children?: ReactNode };
type Context = {
  flow?: Flow;
  options?: ProviderOptions;
  provider?: Provider;
  session?: AuthResult;
  updateAuthConfig: (
    options: ProviderOptions,
    provider: Provider,
    flow?: Flow,
  ) => Promise<void>;
};

const AuthContext = createContext<Context | undefined>(undefined);

const AuthProvider = ({ children }: Props) => {
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
      setProvider(
        (await getProvider()) || providers.find((p) => p.key === "cognito"),
      );
      setFlow((await getFlow()) || flows.find((f) => f.key === "PKCE"));
      setOptions(
        (await getProviderOptions()) || {
          ...awsConfig,
          ...(isPlatform("mobile") ? {} : webConfig),
        },
      );
    };

    performSetup().then(() => setIsSetup(true));
  }, []);

  return (
    <AuthContext.Provider
      value={{ flow, options, provider, session, updateAuthConfig }}
    >
      {isSetup ? children : <IonSpinner />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthProvider;
