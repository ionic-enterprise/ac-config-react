import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import "./TestConnectionPage.css";

const TestConnectionPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Test Connection</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Test Connection</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Test Connection page" />
      </IonContent>
    </IonPage>
  );
};

export default TestConnectionPage;
