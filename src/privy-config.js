export const privyConfig = {
  appId: 'cmf1tadv200dji20bkp26e2xr',
  config: {
    // Login methods - ONLY Twitter, no other options
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
    
    // Social login configuration - ONLY Twitter
    socialProviders: {
      twitter: {
        clientId: process.env.REACT_APP_TWITTER_CLIENT_ID,
      },
    },
    
    // Explicitly disable other login methods
    mfa: {
      noPromptOnMfaRequired: false,
    },
    
    // Disable email/password login
    email: {
      enabled: false,
    },
    
    // Disable phone login
    phone: {
      enabled: false,
    },
    
    // Disable wallet login
    wallet: {
      enabled: false,
    },
    
    // Disable Telegram login
    telegram: {
      enabled: false,
    },
    
    // Disable Discord login
    discord: {
      enabled: false,
    },
    
    // Disable Google login
    google: {
      enabled: false,
    },
    
    // Disable GitHub login
    github: {
      enabled: false,
    },
    
    // Legal
    legal: {
      termsAndConditionsUrl: 'https://your-terms-url.com',
      privacyPolicyUrl: 'https://your-privacy-url.com',
    },
  },
};
