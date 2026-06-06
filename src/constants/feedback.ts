import Constants from 'expo-constants';

export type FeedbackMethod = 'google_form' | 'email';

/** Switch to `email` if you prefer the mail app instead of a web form. */
export const FEEDBACK_METHOD: FeedbackMethod = 'google_form';

/** Fallback if app.json extra.feedbackFormUrl is missing. */
export const FEEDBACK_GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScwn2lR2H4QsomtRvmKIljOSSqGWOk4C_qubIaSDDYrJbIj1g/viewform';

/** Replace with your support email when using FEEDBACK_METHOD = 'email'. */
export const FEEDBACK_EMAIL = 'feedback@example.com';

function getConfiguredGoogleFormUrl() {
  const fromExpoConfig = Constants.expoConfig?.extra?.feedbackFormUrl;
  if (typeof fromExpoConfig === 'string' && fromExpoConfig.includes('docs.google.com/forms/')) {
    return fromExpoConfig;
  }
  return FEEDBACK_GOOGLE_FORM_URL;
}

export function getFeedbackMailtoUrl() {
  const subject = encodeURIComponent('108 Counter — App feedback');
  const body = encodeURIComponent(
    'Hi,\n\nI have suggestions to improve or add to the app:\n\n',
  );
  return `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
}

export function getFeedbackUrl() {
  if (FEEDBACK_METHOD === 'google_form') {
    return getConfiguredGoogleFormUrl();
  }
  return getFeedbackMailtoUrl();
}

export function getFeedbackButtonLabel() {
  return FEEDBACK_METHOD === 'google_form' ? 'Share feedback' : 'Send feedback';
}

export function getFeedbackButtonIcon(): 'chatbox-ellipses-outline' | 'mail-outline' {
  return FEEDBACK_METHOD === 'google_form' ? 'chatbox-ellipses-outline' : 'mail-outline';
}
