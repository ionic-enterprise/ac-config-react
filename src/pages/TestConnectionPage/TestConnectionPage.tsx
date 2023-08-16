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
  const [displayAuthFailed, setDisplayAuthFailed] = useState(false);
  const [displayRefreshFailed, setDisplayRefreshFailed] = useState(false);
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [displayRefreshSuccess, setDisplayRefreshSuccess] = useState(false);

  const { canRefresh, login, logout, refresh, session } = useAuth();

  useEffect(() => {
    canRefresh().then((x) => setDisableRefresh(!x));
  }, [session]);

  const handleAuth = async () => {
    try {
      await performAuth();
    } catch (err: any) {
      setDisplayAuthFailed(true);
    }
  };

  const performAuth = async () => {
    if (session) {
      await logout();
    } else {
      await login();
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      setDisplayRefreshSuccess(true);
    } catch (err: any) {
      setDisplayRefreshFailed(true);
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
                onClick={() => handleRefresh()}
              >
                Refresh
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={displayRefreshSuccess}
          message="The refresh was successful!!"
          color="success"
          duration={3000}
          position="middle"
          onDidDismiss={() => setDisplayRefreshSuccess(false)}
        ></IonToast>

        <IonToast
          isOpen={displayAuthFailed}
          message="Authentication failed!"
          color="danger"
          duration={3000}
          position="middle"
          onDidDismiss={() => setDisplayAuthFailed(false)}
        ></IonToast>

        <IonToast
          isOpen={displayRefreshFailed}
          message="Refresh failed!"
          color="danger"
          duration={3000}
          position="middle"
          onDidDismiss={() => setDisplayRefreshFailed(false)}
        ></IonToast>
      </IonContent>
    </IonPage>
  );
};

export default TestConnectionPage;
