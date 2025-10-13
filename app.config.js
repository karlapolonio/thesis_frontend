import 'dotenv/config';

export default {
  expo: {
    name: "thesis_frontend",
    slug: "thesis_frontend",
    version: "1.0.0",
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
    }
  }
};
