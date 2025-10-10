import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      API_KEY: process.env.API_KEY,
      BACKEND_URL: process.env.BACKEND_URL,
    },
  };
};