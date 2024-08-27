import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#ff9800",
    },
    background: {
      default: "#121212",
      paper: "#1d1d1d",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5",
    },
    action: {
      hover: "rgba(255, 255, 255, 0.08)",
      selected: "rgba(255, 255, 255, 0.16)",
      disabled: "rgba(255, 255, 255, 0.3)",
      focus: "rgba(255, 255, 255, 0.12)",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1d1d1d",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          "&$selected": {
            backgroundColor: "rgba(255, 255, 255, 0.16)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.16)",
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "rgba(0,0,0,.8)",
          backdropFilter: "blur(10px)",
          color: "#ffffff",
          borderRadius: 10,
          border: "2px rgba(38,100,100,.8) solid",
          padding: "16px",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#1976d2",
            },
            "&:hover fieldset": {
              borderColor: "#64b5f6",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1565c0",
            },
          },
          "& .MuiSelect-icon": {
            color: "#1976d2",
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.25rem",
          fontWeight: 500,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          fontWeight: 400,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "8px 16px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#2c2c2c", // Lighter background for input fields
            "& fieldset": {
              borderColor: "#1976d2", // Border color for input fields
            },
            "&:hover fieldset": {
              borderColor: "#64b5f6", // Border color on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1565c0", // Border color when focused
            },
          },
          "& .MuiInputBase-input": {
            color: "#ffffff", // Text color inside the input fields
          },
          "& .MuiInputLabel-root": {
            color: "#b0bec5", // Label color for input fields
          },
        },
      },
    },
  },
});

export { darkTheme };
