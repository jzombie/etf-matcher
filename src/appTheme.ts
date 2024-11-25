import { useMemo } from "react";

import { createTheme } from "@mui/material/styles";

export type AppThemeFontMode = "normal" | "reduced";

export default function useAppTheme({
  fontMode,
}: {
  fontMode: AppThemeFontMode;
}) {
  const isReducedFontMode = fontMode === "reduced";

  const theme = useMemo(
    () =>
      createTheme({
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
        typography: {
          fontSize: isReducedFontMode ? 12 : undefined, // Reduce the base font size (default is 14)
          button: {
            fontSize: isReducedFontMode ? "0.875rem" : undefined, // Smaller button text
          },
        },
        spacing: 4, // Reduce the spacing scale (default is 8)
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: "#1d1d1d",
              },
            },
          },
          MuiButton: {
            defaultProps: {
              size: "small",
            },
            styleOverrides: {
              root: {
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
                padding: isReducedFontMode ? "2px 6px" : undefined, // Smaller padding
                fontSize: isReducedFontMode ? "0.875rem" : undefined, // Smaller text size for buttons
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: {
                fontSize: isReducedFontMode ? "0.875rem" : undefined, // Smaller input text
                padding: isReducedFontMode ? "4px 8px" : undefined, // Smaller padding
              },
            },
          },
          MuiToggleButtonGroup: {
            defaultProps: {
              size: "small",
            },
          },
          MuiIconButton: {
            defaultProps: {
              size: "small",
            },
          },
          MuiFab: {
            defaultProps: {
              size: "small",
            },
          },
          MuiCheckbox: {
            defaultProps: {
              size: "small",
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
                padding: isReducedFontMode ? "8px" : undefined, // Reduce padding inside dialogs
                fontSize: isReducedFontMode ? "0.875rem" : undefined, // Smaller text size inside dialogs,
                backgroundColor: "rgba(0,0,0,.8)",
                backdropFilter: "blur(10px)",
                color: "#ffffff",
                borderRadius: 10,
                border: "2px rgba(38,100,100,.8) solid",
              },
            },
          },
          MuiSelect: {
            defaultProps: {
              size: "small",
            },
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
            defaultProps: {
              size: "small",
            },
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
                  "&.Mui-disabled fieldset": {
                    borderColor: "#565d60", // Border color when disabled
                  },
                  "&.Mui-disabled:hover fieldset": {
                    borderColor: "#565d60", // Prevent hover border color change when disabled
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#ffffff", // Text color inside the input fields
                },
                "& .MuiInputLabel-root": {
                  color: "#b0bec5", // Label color for input fields
                  marginTop: isReducedFontMode ? 7 : 0,
                  marginLeft: isReducedFontMode ? 7 : 0,
                },
                "&.Mui-disabled .MuiInputLabel-root": {
                  color: "#b0bec5", // Label color when disabled
                },
                fontSize: isReducedFontMode ? "0.875rem" : undefined, // Smaller input text
                padding: isReducedFontMode ? "4px 8px" : undefined, // Smaller padding
              },
            },
          },
          MuiTypography: {
            styleOverrides: {
              root: {
                "& a": {
                  color: "inherit",
                  "&:visited": {
                    color: "inherit",
                  },
                },
              },
            },
          },
          MuiSwitch: {
            defaultProps: {
              size: "small",
            },
          },
          MuiRadio: {
            defaultProps: {
              size: "small",
            },
          },
          MuiAutocomplete: {
            defaultProps: {
              size: "small",
            },
          },
          MuiPagination: {
            defaultProps: {
              size: "small",
            },
          },
        },
      }),
    [isReducedFontMode],
  );

  return theme;
}
