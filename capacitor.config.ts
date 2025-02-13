import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.acconfigreact",
  appName: "AC Config Tool",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
    StatusBar: {
      overlaysWebView: false,
    },
  },
};

export default config;
