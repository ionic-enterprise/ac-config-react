import { AuthResult, ProviderOptions } from "@ionic-enterprise/auth";
import { Flow, Provider } from "./auth-config";
import { Preferences } from "@capacitor/preferences";

const authProviderKey = "auth-provider";
const authProviderOptionsKey = "auth-provider-options";
const authFlowKey = "auth-flow";
const authResultKey = "auth-result";

let currentOptions: ProviderOptions | undefined;
let currentFlow: Flow | undefined;
let currentProvider: Provider | undefined;
let currentAuthResult: AuthResult | undefined;

export const resetCache = (): void => {
  currentOptions = undefined;
  currentFlow = undefined;
  currentProvider = undefined;
  currentAuthResult = undefined;
};

export const getProviderOptions = async (): Promise<
  ProviderOptions | undefined
> => {
  if (!currentOptions) {
    const { value } = await Preferences.get({
      key: authProviderOptionsKey,
    });
    currentOptions = value ? JSON.parse(value) : undefined;
  }
  return currentOptions;
};

export const getFlow = async (): Promise<Flow | undefined> => {
  if (!currentFlow) {
    const { value } = await Preferences.get({ key: authFlowKey });
    currentFlow = value ? JSON.parse(value) : undefined;
  }
  return currentFlow;
};

export const getProvider = async (): Promise<Provider | undefined> => {
  if (!currentProvider) {
    const { value } = await Preferences.get({ key: authProviderKey });
    currentProvider = value ? JSON.parse(value) : undefined;
  }
  return currentProvider;
};

export const getAuthResult = async (): Promise<AuthResult | undefined> => {
  if (!currentAuthResult) {
    const { value } = await Preferences.get({ key: authResultKey });
    currentAuthResult = value ? JSON.parse(value) : undefined;
  }
  return currentAuthResult;
};

export const storeAuthResult = async (
  authResult: AuthResult,
): Promise<void> => {
  await Preferences.set({
    key: authResultKey,
    value: JSON.stringify(authResult),
  });
  currentAuthResult = authResult;
};

export const clearAuthResult = async (): Promise<void> => {
  await Preferences.remove({ key: "auth-result" });
  currentAuthResult = undefined;
};

export const storeConfig = async (
  provider: Provider,
  options: ProviderOptions,
  flow?: Flow,
): Promise<void> => {
  await Promise.all([
    Preferences.set({
      key: authProviderKey,
      value: JSON.stringify(provider),
    }),
    Preferences.set({
      key: authProviderOptionsKey,
      value: JSON.stringify(options),
    }),
    flow
      ? Preferences.set({
          key: authFlowKey,
          value: JSON.stringify(flow),
        })
      : Preferences.remove({ key: authFlowKey }),
  ]);
  currentProvider = provider;
  currentOptions = options;
  currentFlow = flow;
};
