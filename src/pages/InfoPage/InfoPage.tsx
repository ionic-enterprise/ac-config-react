import { Capacitor } from "@capacitor/core";
import { ProviderOptions } from "@ionic-enterprise/auth";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { Flow, Provider } from "../../util/auth-config";
import {
  getFlow,
  getProvider,
  getProviderOptions,
} from "../../util/auth-store";
import "./InfoPage.css";

const InfoPage: React.FC = () => {
  const [showFlow, setShowFlow] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [accessTokenExpired, setAccessTokenExpired] = useState(false);
  const [refreshAvailable, setRefreshAvailable] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [config, setConfig] = useState<ProviderOptions | undefined>();
  const [provider, setProvider] = useState<Provider | undefined>();
  const [flow, setFlow] = useState<Flow | undefined>();
  const [rawConfig, setRawConfig] = useState("");

  const { canRefresh, isExpired, session } = useAuth();

  useEffect(() => {
    setAccessToken(session?.accessToken || "");
    setLoggedIn(!!session);
    canRefresh().then((x) => setRefreshAvailable(x));
    isExpired().then((x) => setAccessTokenExpired(x));
  }, [session]);

  useIonViewDidEnter(() => {
    const isWeb = !Capacitor.isNativePlatform();
    setShowFlow(isWeb);
    const updateData = async () => {
      const config = await getProviderOptions();
      setProvider(await getProvider());
      setAccessTokenExpired(await isExpired());
      setConfig(config);
      setRawConfig(config ? JSON.stringify(config, undefined, 2) : "");
      if (isWeb) {
        setFlow(await getFlow());
      }
    };

    updateData();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Information</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Current Status</h1>
        <dl>
          <dt>Currently Logged In</dt>
          <dd>{loggedIn ? "Yes" : "No"}</dd>
        </dl>
        <dl>
          <dt>Access Token is Expired</dt>
          <dd>{accessTokenExpired ? "Yes" : "No"}</dd>
        </dl>
        <dl>
          <dt>Refresh is Available</dt>
          <dd>{refreshAvailable ? "Yes" : "No"}</dd>
        </dl>
        <dl>
          <dt>Access Token</dt>
          <dd>{accessToken}</dd>
        </dl>

        <h1>Current Configuration</h1>
        <dl>
          <dt>Provider</dt>
          <dd>{provider?.value}</dd>
        </dl>
        <dl>
          <dt>Client ID</dt>
          <dd>{config?.clientId}</dd>
        </dl>
        <dl>
          <dt>Discovery URL</dt>
          <dd>
            <a target="_blank" href={config?.discoveryUrl} rel="noreferrer">
              {config?.discoveryUrl}
            </a>
          </dd>
        </dl>
        <dl>
          <dt>Scope</dt>
          <dd>{config?.scope}</dd>
        </dl>
        <dl>
          <dt>Audience</dt>
          <dd>{config?.audience}</dd>
        </dl>
        {showFlow && (
          <dl>
            <dt>Web Auth Flow</dt>
            <dd>{flow?.value || "implicit (using default)"}</dd>
          </dl>
        )}
        <h1>Raw Configuration</h1>
        <pre>{rawConfig}</pre>

        <h1>Updating the Configuration</h1>
        <h2>General Configuration</h2>
        <p>
          The following configuration items can be customized via the
          &quot;Settings&quot; page to accomodate the needs of your OIDC
          provider.
        </p>
        <ul>
          <li>authConfig (Provider)</li>
          <li>clientID</li>
          <li>discoveryUrl</li>
          <li>scope</li>
          <li>audience</li>
          <li>webAuthFlow</li>
        </ul>

        <h2>Advanced Configuration</h2>
        <p>
          Some items cannot be configured without changing code in the
          application itself. This is due either to specific redirect schemes
          needing to be allowed by the mobile applications or due to certain
          parameters requiring other special coding. As such, it makes no sense
          to allow the user to change them from the app.
        </p>
        <p>
          If you need to change any of the following settings, you will also
          need to make appropriate changes in the code and recompile the app:
        </p>

        <ul>
          <li>redirectUri</li>
          <li>logoutUrl</li>
          <li>uiMode</li>
        </ul>

        <p>
          This app also does not directly allow changing the following settings
          as they do not affect the actual connection:
        </p>
        <ul>
          <li>androidToolbarColor</li>
          <li>iosWebView</li>
          <li>logLevel (this is hardcoded to DEBUG for this app)</li>
          <li>
            platform (this is set for you automatically depending on how the app
            is run)
          </li>
          <li>safariWebViewOptions</li>
          <li>tokenStorageProvider</li>
        </ul>
      </IonContent>
    </IonPage>
  );
};

export default InfoPage;
