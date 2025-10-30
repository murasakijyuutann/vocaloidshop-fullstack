// src/styles/theme.ts
export const lightTheme = {
  colors: {
    primary: "#39c5bb",   // Miku teal
    accent:  "#ff66a5",   // Miku pink
    bg:      "#f9f9fb",
    text:    "#1f1f2e",
    border:  "#e0e0e0"
  },
  fonts: {
    base: "'Poppins', 'Noto Sans JP', sans-serif"
  },
  breakpoints: {
    mobile: "768px"
  }
};

export const darkTheme: typeof lightTheme = {
  colors: {
    primary: "#39c5bb",
    accent:  "#ff66a5",
    bg:      "#0f1115",
    text:    "#eaeaf0",
    border:  "#2a2d3a"
  },
  fonts: {
    base: "'Poppins', 'Noto Sans JP', sans-serif"
  },
  breakpoints: {
    mobile: "768px"
  }
};

export type ThemeType = typeof lightTheme;
