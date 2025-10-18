import 'dotenv/config';

export default {
  expo: {
    name: "NutriApp",
    slug: "thesis_frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    extra: {
      API_KEY: process.env.API_KEY,
      BACKEND_URL: process.env.BACKEND_URL,
      eas: {
        projectId: "a391dfff-70c7-4fe7-8bf4-a2b31ef9a33a"
      }
    },
    updates: {
      url: "https://u.expo.dev/a391dfff-70c7-4fe7-8bf4-a2b31ef9a33a"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    ios: { supportsTablet: true },
    android: {
      package: "com.thesisnine.thesisfrontend",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: { favicon: "./assets/favicon.png" },
    userInterfaceStyle: "light",
  }
};
