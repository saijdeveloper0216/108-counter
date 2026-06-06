import Constants from 'expo-constants';

/** Set in app.json → extra.supportEmail (Play Console developer contact). */
export const SUPPORT_EMAIL =
  (typeof Constants.expoConfig?.extra?.supportEmail === 'string'
    ? Constants.expoConfig.extra.supportEmail
    : '') || 'support@example.com';

/** Public URL after hosting docs/privacy-policy.html (GitHub Pages, etc.). */
export function getPrivacyPolicyUrl(): string | null {
  const url = Constants.expoConfig?.extra?.privacyPolicyUrl;
  if (typeof url === 'string' && url.startsWith('https://')) {
    return url;
  }
  return null;
}

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}
