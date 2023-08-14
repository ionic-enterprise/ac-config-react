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
  IonToast,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import "./TestConnectionPage.css";

const TestConnectionPage: React.FC = () => {
  const [loginFailed, setLoginFailed] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [displayRefreshAlert, setDisplayRefreshAlert] = useState(false);

  const { canRefresh, login, logout, refresh, session } = useAuth();

  useEffect(() => {
    canRefresh().then((x) => setDisableRefresh(!x));
  }, [session]);

  const handleAuth = async () => {
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
      setLoginFailed(true);
    }
  };

  const performLogout = async () => {
    await logout();
  };

  const performRefresh = async () => {
    try {
      await refresh();
      setDisplayRefreshAlert(true);
    } catch (err: any) {
      setRefreshFailed(true);
    }
  };

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

        <IonToast
          isOpen={loginFailed}
          message="Login failed!"
          color="danger"
          duration={3000}
          position="middle"
          onDidDismiss={() => setLoginFailed(false)}
        ></IonToast>

        <IonToast
          isOpen={refreshFailed}
          message="Refresh failed!"
          color="danger"
          duration={3000}
          position="middle"
          onDidDismiss={() => setRefreshFailed(false)}
        ></IonToast>
      </IonContent>
    </IonPage>
  );
};

export default TestConnectionPage;
