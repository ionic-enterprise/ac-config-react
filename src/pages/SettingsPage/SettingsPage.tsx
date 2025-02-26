import { Capacitor } from "@capacitor/core";
import { ProviderOptions } from "@ionic-enterprise/auth";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import {
  Flow,
  Provider,
  auth0Config,
  awsConfig,
  azureConfig,
  flows,
  mobileConfig,
  oktaConfig,
  providers,
  webConfig,
} from "../../util/auth-config";
import "./SettingsPage.css";

const SettingsPage: React.FC = () => {
  const {
    options,
    flow: authFlow,
    provider: authProvider,
    session,
    updateAuthConfig,
  } = useAuth();

  const [audience, setAudience] = useState("");
  const [clientId, setClientId] = useState("");
  const [discoveryUrl, setDiscoveryUrl] = useState("");
  const [flow, setFlow] = useState<Flow | undefined>();
  const [provider, setProvider] = useState<Provider | undefined>();
  const [scope, setScope] = useState("");
  const [disableEdits, setDisableEdits] = useState(false);
  const [disableTemplates, setDisableTemplates] = useState(false);

  const showFlow = !Capacitor.isNativePlatform();

  useEffect(() => {
    setDisableEdits(!!session);
    setDisableTemplates(
      !!session || import.meta.env.VITE_AUTH_URL_SCHEME !== "msauth",
    );
    setAudience(options?.audience || "");
    setClientId(options?.clientId || "");
    setDiscoveryUrl(options?.discoveryUrl || "");
    setScope(options?.scope || "");
    setFlow(authFlow);
    setProvider(authProvider);
  }, [authFlow, authProvider, options, session]);

  const compareKVPair = (
    x: { key: string; value: unknown },
    y: { key: string; value: unknown },
  ) => {
    return x && y && x.key === y.key;
  };

  const configureAzure = async () => {
    await setIonicProvider(azureConfig, "azure", "implicit");
  };

  const configureAws = async () => {
    await setIonicProvider(awsConfig, "cognito", "PKCE");
  };

  const configureAuth0 = async () => {
    await setIonicProvider(auth0Config, "auth0", "implicit");
  };

  const configureOkta = async () => {
    await setIonicProvider(oktaConfig, "okta", "PKCE");
  };

  const configureCustom = async () => {
    await setIonicProvider(
      {
        ...(Capacitor.isNativePlatform() ? mobileConfig : webConfig),
        clientId,
        discoveryUrl,
        audience,
        scope,
      },
      provider?.key || "",
      flow?.key || "",
    );
  };

  const setIonicProvider = async (
    opt: ProviderOptions,
    providerKey: string,
    flowKey: string,
  ) => {
    await updateAuthConfig(
      {
        ...opt,
        ...(Capacitor.isNativePlatform() ? {} : webConfig),
      },
      providers.find((p) => p.key === providerKey) as Provider,
      Capacitor.isNativePlatform()
        ? undefined
        : flows.find((f) => f.key === flowKey),
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle data-testid="page-title">Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {disableEdits && (
          <div className="error-message" data-testid="logout-message">
            Please log out first
          </div>
        )}
        <IonList>
          <IonListHeader> Ionic&apos;s OIDC Server Options</IonListHeader>
          <IonItem>
            <IonLabel>
              <IonButton
                expand="full"
                disabled={disableTemplates}
                onClick={() => configureAzure()}
                data-testid="use-azure"
              >
                Use Azure
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <IonButton
                expand="full"
                disabled={disableTemplates}
                onClick={() => configureAws()}
                data-testid="use-aws"
              >
                Use AWS Cognito
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <IonButton
                expand="full"
                disabled={disableTemplates}
                onClick={() => configureAuth0()}
                data-testid="use-auth0"
              >
                Use Auth0
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <IonButton
                expand="full"
                disabled={disableTemplates}
                onClick={() => configureOkta()}
                data-testid="use-okta"
              >
                Use Okta
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonListHeader> Customize </IonListHeader>
          <IonItem>
            <IonSelect
              value={provider}
              onIonChange={(e) => setProvider(e.detail.value!)}
              compareWith={compareKVPair}
              disabled={disableEdits}
              label="Auth Config"
              data-testid="provider-input"
            >
              {providers.map((p) => (
                <IonSelectOption value={p} key={p.key}>
                  {p.value}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonInput
              value={clientId}
              onIonChange={(e) => setClientId(e.detail.value!)}
              disabled={disableEdits}
              label-placement="floating"
              label="Client ID"
              data-testid="client-id-input"
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonInput
              value={discoveryUrl}
              onIonChange={(e) => setDiscoveryUrl(e.detail.value!)}
              disabled={disableEdits}
              label-placement="floating"
              label="Discovery URL"
              data-testid="discovery-url-input"
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonInput
              value={scope}
              onIonChange={(e) => setScope(e.detail.value!)}
              disabled={disableEdits}
              label-placement="floating"
              label="Scope"
              data-testid="scope-input"
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonInput
              value={audience}
              onIonChange={(e) => setAudience(e.detail.value!)}
              disabled={disableEdits}
              label-placement="floating"
              label="Audience"
              data-testid="audience-input"
            ></IonInput>
          </IonItem>
          {showFlow && (
            <IonItem v-if="showFlow">
              <IonSelect
                value={flow}
                compareWith={compareKVPair}
                disabled={disableEdits}
                label="Web Auth Flow"
                onIonChange={(e) => setFlow(e.detail.value!)}
                data-testid="flow-input"
              >
                {flows.map((f) => (
                  <IonSelectOption value={f} key={f.key}>
                    {f.value}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          )}
          <IonItem>
            <IonLabel>
              <IonButton
                expand="full"
                disabled={disableEdits}
                onClick={() => configureCustom()}
                data-testid="use-customization"
              >
                Use Custom Configuration
              </IonButton>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
