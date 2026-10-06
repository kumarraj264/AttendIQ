/**
 * Utility to trigger browser-based haptic feedback using the HTML5 Vibration API.
 * Provides distinct tactile sensations for various user interactions.
 */

export const HapticType = {
  LIGHT: 'light',      // Normal button clicks, soft keypad taps
  MEDIUM: 'medium',    // Submitting a standard action, switching tab
  HEAVY: 'heavy',      // Confirming a transaction, sliding a confirmation bar
  SUCCESS: 'success',  // Correct PIN, successful attendance mark, verification OK
  WARNING: 'warning',  // Geofence warning, caution state
  ERROR: 'error'       // Wrong PIN, validation failure, API error
} as const;

export type HapticFeedbackType = typeof HapticType[keyof typeof HapticType];

export const triggerHaptic = (type: HapticFeedbackType = 'light') => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        // A single short vibration (15ms)
        window.navigator.vibrate(15);
        break;
      case 'medium':
        // A standard tactile click (35ms)
        window.navigator.vibrate(35);
        break;
      case 'heavy':
        // A firm tactile press (60ms)
        window.navigator.vibrate(60);
        break;
      case 'success':
        // Double pulse: short-gap-short (40ms on, 60ms off, 40ms on)
        window.navigator.vibrate([40, 60, 40]);
        break;
      case 'warning':
        // Long single pulse (150ms)
        window.navigator.vibrate(150);
        break;
      case 'error':
        // Triple short rapid pulse (80ms on, 50ms off, 80ms on, 50ms off, 80ms on)
        window.navigator.vibrate([80, 50, 80, 50, 80]);
        break;
    }
  } catch (error) {
    // Suppress errors due to browser permission / context restrictions
  }
};
