import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import "./TestConnectionPage.css";

const TestConnectionPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [displayRefreshAlert, setDisplayRefreshAlert] = useState(false);

  const { canRefresh, login, logout, refresh, session } = useAuth();

  useEffect(() => {
    canRefresh().then((x) => setDisableRefresh(!x));
  }, [session]);

  const handleAuth = async () => {
    setErrorMessage("");
    if (session) {
      await performLogout();
    } else {
      await performLogin();
    }
  };

  const performLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      setErrorMessage("Login failed");
    }
  };

  const performLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      setErrorMessage("Logout failed");
    }
  };

  const performRefresh = async () => {
    try {
      await refresh();
      setDisplayRefreshAlert(true);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const hideRefreshAlert = () => {};

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Test Connection</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle> Auth Connect Config </IonCardTitle>
            <IonCardSubtitle>
              The Auth Connect Configuration Tester
            </IonCardSubtitle>
          </IonCardHeader>

          <IonCardContent>
            <IonLabel data-testid="auth-status-label">
              Status:&nbsp;
              <span className="status">
                {session ? "Logged In" : "Logged Out"}
              </span>
            </IonLabel>
            <div className="error-message">{errorMessage}</div>
            <div className="actions">
              <IonButton
                fill="outline"
                data-testid="auth-button"
                onClick={() => handleAuth()}
              >
                {session ? "Log Out" : "Log In"}
              </IonButton>
              <IonButton
                disabled={disableRefresh}
                data-testid="refresh-button"
                onClick={() => performRefresh()}
              >
                Refresh
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        <IonAlert
          isOpen={displayRefreshAlert}
          header="Refresh"
          message="The refresh was a success!!"
          buttons={["OK"]}
          onDidDismiss={() => setDisplayRefreshAlert(false)}
        ></IonAlert>
      </IonContent>
    </IonPage>
  );
};

export default TestConnectionPage;