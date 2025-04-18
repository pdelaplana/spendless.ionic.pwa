import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'spendless',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Camera: {
      permissions: true,
    },
  },
};

export default config;
