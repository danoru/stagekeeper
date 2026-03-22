import { ThemeOptions } from "@mui/material/styles";

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    background: {
      default: "#080C14",
      paper: "#0D1520",
    },
    primary: {
      main: "#D4AF55",
      light: "#E8CC80",
      dark: "#B8962E",
      contrastText: "#080C14",
    },
    secondary: {
      main: "#E8DCC8",
      light: "#F4EEE0",
      dark: "#C8B898",
      contrastText: "#080C14",
    },
    error: {
      main: "#CF4444",
    },
    divider: "rgba(212, 175, 85, 0.15)",
    text: {
      primary: "#E8DCC8",
      secondary: "rgba(232, 220, 200, 0.55)",
      disabled: "rgba(232, 220, 200, 0.3)",
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 300,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 300,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 400,
    },
    h4: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 400,
    },
    h5: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    h6: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"DM Sans", sans-serif',
      fontSize: "0.85rem",
      letterSpacing: "0.02em",
    },
    subtitle2: {
      fontFamily: '"DM Sans", sans-serif',
      fontSize: "0.75rem",
      letterSpacing: "0.04em",
    },
    body1: {
      fontFamily: '"DM Sans", sans-serif',
      fontSize: "0.9rem",
    },
    body2: {
      fontFamily: '"DM Sans", sans-serif',
      fontSize: "0.8rem",
      color: "rgba(232, 220, 200, 0.55)",
    },
    overline: {
      fontFamily: '"DM Sans", sans-serif',
      fontSize: "0.62rem",
      letterSpacing: "0.2em",
      fontWeight: 500,
    },
    button: {
      fontFamily: '"DM Sans", sans-serif',
      letterSpacing: "0.08em",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 3,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(8, 12, 20, 0.97)",
          backgroundImage: "none",
          borderBottom: "1px solid rgba(212, 175, 85, 0.15)",
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 500,
          letterSpacing: "0.06em",
        },
        contained: {
          background: "linear-gradient(135deg, #D4AF55, #B8962E)",
          color: "#080C14",
          boxShadow: "none",
          "&:hover": {
            background: "linear-gradient(135deg, #E8CC80, #C8A840)",
            boxShadow: "0 4px 16px rgba(212, 175, 85, 0.25)",
          },
        },
        outlined: {
          borderColor: "rgba(212, 175, 85, 0.35)",
          color: "#E8DCC8",
          "&:hover": {
            borderColor: "#D4AF55",
            backgroundColor: "rgba(212, 175, 85, 0.06)",
          },
        },
        text: {
          color: "rgba(232, 220, 200, 0.7)",
          "&:hover": {
            color: "#D4AF55",
            backgroundColor: "rgba(212, 175, 85, 0.06)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#0D1520",
          border: "1px solid rgba(212, 175, 85, 0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#0D1520",
          border: "1px solid rgba(212, 175, 85, 0.1)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(212, 175, 85, 0.12)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(212, 175, 85, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(212, 175, 85, 0.4)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#D4AF55",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#D4AF55",
          },
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: "#D4AF55",
        },
        iconEmpty: {
          color: "rgba(212, 175, 85, 0.25)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: "rgba(212, 175, 85, 0.25)",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: "rgba(212, 175, 85, 0.2)",
          color: "rgba(232, 220, 200, 0.6)",
          "&.Mui-selected": {
            backgroundColor: "rgba(212, 175, 85, 0.12)",
            color: "#D4AF55",
            borderColor: "rgba(212, 175, 85, 0.4)",
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: "#D4AF55",
          color: "#080C14",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "rgba(232, 220, 200, 0.5)",
          "&.Mui-selected": {
            color: "#D4AF55",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#D4AF55",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            borderBottomColor: "rgba(212, 175, 85, 0.2)",
            color: "#D4AF55",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          },
        },
      },
    },
  },
};

export default darkThemeOptions;
