declare module 'tailwindcss/tailwind-config' {
  export interface TailwindThemeConfig {
    colors: {
      primary: string;
      surface: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
    };
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    spacing: {
      px: string;
      0: string;
      0.5: string;
      1: string;
      2: string;
      3: string;
      4: string;
      6: string;
      8: string;
      12: string;
      16: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      full: string;
    };
    boxShadow: {
      sm: string;
      md: string;
      lg: string;
    };
    transitionProperty: {
      all: string;
      colors: string;
    };
  }
} 