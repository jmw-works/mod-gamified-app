import type { Theme } from '@aws-amplify/ui-react';

/**
 * Custom Amplify UI theme that mirrors the design tokens defined in `theme.css`.
 * These tokens control fonts, colors, and button styles for Amplify components
 * such as the Authenticator.
 */
export const customTheme: Theme = {
  name: 'custom-theme',
  tokens: {
    fonts: {
      default: {
        variable: {
          value:
            "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        },
        static: {
          value:
            "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        },
      },
    },
    colors: {
      background: {
        primary: { value: '#f8f9fa' },
      },
      font: {
        primary: { value: '#111827' },
      },
      brand: {
        primary: {
          10: { value: '#e7bb73' },
          80: { value: '#d8a854' },
        },
      },
    },
    space: {
      xxs: { value: '4px' },
      xs: { value: '8px' },
      sm: { value: '12px' },
      md: { value: '16px' },
      lg: { value: '24px' },
    },
    components: {
      button: {
        borderRadius: { value: '4px' },
        fontWeight: { value: '600' },
        primary: {
          backgroundColor: { value: '{colors.brand.primary.10}' },
          borderColor: { value: '{colors.brand.primary.10}' },
          color: { value: '#ffffff' },
          _hover: {
            backgroundColor: { value: '{colors.brand.primary.80}' },
            borderColor: { value: '{colors.brand.primary.80}' },
          },
        },
      },
    },
  },
};

export default customTheme;
