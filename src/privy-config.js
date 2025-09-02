export const privyConfig = {
  appId: 'cmf1tadv200dji20bkp26e2xr',
  config: {
    // Login methods - only Twitter
    loginMethods: ['twitter'],
    
    // Appearance
    appearance: {
      theme: 'dark',
      accentColor: '#0066ff',
      logo: 'https://your-logo-url.com/logo.png', // Optional: add your logo
    },
    
    // No embedded wallets
    embeddedWallets: {
      createOnLogin: 'off',
    },
    
    // Social login configuration - only Twitter
    socialProviders: {
      twitter: {
        clientId: process.env.REACT_APP_TWITTER_CLIENT_ID,
      },
    },
    
    // Legal
    legal: {
      termsAndConditionsUrl: 'https://your-terms-url.com',
      privacyPolicyUrl: 'https://your-privacy-url.com',
    },
  },
};
