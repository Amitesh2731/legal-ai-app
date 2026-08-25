import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legalai.mobile',
  appName: 'Legal AI',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
