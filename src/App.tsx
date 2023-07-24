import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  informationCircleOutline,
  logInOutline,
  settingsOutline,
} from "ionicons/icons";
import { Redirect, Route } from "react-router-dom";
import Info from "./pages/Info/Info";
import Settings from "./pages/Settings/Settings";
import TestConnection from "./pages/TestConnection/TestConnection";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/test-connection">
            <TestConnection />
          </Route>
          <Route exact path="/settings">
            <Settings />
          </Route>
          <Route path="/info">
            <Info />
          </Route>
          <Route exact path="/">
            <Redirect to="/test-connection" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="test-connection" href="/test-connection">
            <IonIcon aria-hidden="true" icon={logInOutline} />
            <IonLabel>Test Connection</IonLabel>
          </IonTabButton>
          <IonTabButton tab="settings" href="/settings">
            <IonIcon aria-hidden="true" icon={settingsOutline} />
            <IonLabel>Settings</IonLabel>
          </IonTabButton>
          <IonTabButton tab="info" href="/info">
            <IonIcon aria-hidden="true" icon={informationCircleOutline} />
            <IonLabel>Info</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
