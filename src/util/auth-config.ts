import { ProviderOptions } from "@ionic-enterprise/auth";

export interface Flow {
  key: "implicit" | "PKCE";
  value: string;
}

export const flows: Flow[] = [
  { key: "implicit", value: "Implicit" },
  { key: "PKCE", value: "PKCE" },
];

export interface Provider {
  key: "auth0" | "azure" | "cognito" | "okta" | "onelogin";
  value: string;
}

export const providers: Provider[] = [
  { key: "auth0", value: "Auth0" },
  { key: "azure", value: "Azure B2C" },
  { key: "cognito", value: "Cognito (AWS)" },
  { key: "okta", value: "Okta" },
  { key: "onelogin", value: "OneLogin" },
];

export const auth0Config: ProviderOptions = {
  // audience value is required for auth0's config. If it doesn't exist, the jwt payload will be empty
  audience: "https://io.ionic.demo.ac",
  clientId: "yLasZNUGkZ19DGEjTmAITBfGXzqbvd00",
  discoveryUrl:
    "https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration",
  redirectUri: "msauth://auth-action-complete",
  logoutUrl: "msauth://auth-action-complete",
  scope: "openid email picture profile offline_access",
};

export const awsConfig: ProviderOptions = {
  clientId: "64p9c53l5thd5dikra675suvq9",
  discoveryUrl:
    "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration",
  redirectUri: "msauth://auth-action-complete",
  logoutUrl: "msauth://auth-action-complete",
  scope: "openid email profile",
  audience: "",
};

export const azureConfig: ProviderOptions = {
  clientId: "ed8cb65d-7bb2-4107-bc36-557fb680b994",
  scope:
    "openid offline_access email profile https://dtjacdemo.onmicrosoft.com/ed8cb65d-7bb2-4107-bc36-557fb680b994/demo.read",
  discoveryUrl:
    "https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_acdemo2",
  redirectUri: "msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D",
  logoutUrl: "msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D",
  audience: "",
};

export const oktaConfig: ProviderOptions = {
  clientId: "0oaur4c907I5uMr4I0h7",
  discoveryUrl:
    "https://dev-622807.oktapreview.com/.well-known/openid-configuration",
  redirectUri: "msauth://auth-action-complete",
  logoutUrl: "msauth://auth-action-complete",
  scope: "openid email profile offline_access",
  audience: "",
};

export const webConfig = {
  redirectUri: "http://localhost:8100/auth-action-complete",
  logoutUrl: "http://localhost:8100/auth-action-complete",
};

export const mobileConfig = {
  redirectUri: `${import.meta.env.VITE_AUTH_URL_SCHEME}://auth-action-complete`,
  logoutUrl: `${import.meta.env.VITE_AUTH_URL_SCHEME}://auth-action-complete`,
};
