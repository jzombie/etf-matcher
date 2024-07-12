import React, { useState } from "react";
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Home, Settings, Menu as MenuIcon } from "@mui/icons-material";
import { Link, useLocation, matchPath } from "react-router-dom";
import SearchModalButton from "@components/SearchModalButton";
import clsx from "clsx";
import { styled } from "@mui/system";

export default function HeaderMenu() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

  const isDesktop = useMediaQuery("@media (min-width:748px)");

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { key: "/", label: "Home", icon: <Home fontSize="small" />, link: "/" },
    {
      key: "/portfolios",
      label: "Portfolios",
      icon: null,
      link: "/portfolios",
    },
    {
      key: "/watchlists",
      label: "Watchlists",
      icon: null,
      link: "/watchlists",
    },
    {
      key: "/settings",
      label: "Settings",
      icon: <Settings fontSize="small" />,
      link: "/settings",
    },
  ];

  const selectedKey = menuItems.find(
    (item) =>
      matchPath({ path: item.key, end: true }, location.pathname) ||
      matchPath({ path: `${item.key}/*`, end: false }, location.pathname)
  )?.key;

  const StyledBranding = styled(Typography)(({ theme }) => ({
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    fontSize: "1.5rem",
    marginRight: theme.spacing(2),
    color: "white",
    flexGrow: 1, // Makes the branding take up all available space
  }));

  return (
    <AppBar position="relative">
      <Toolbar>
        {isDesktop ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // Center all items
              flexGrow: 1,
            }}
          >
            <StyledBranding>ETF Matcher</StyledBranding>
            {menuItems.map((item) => (
              <Box
                key={item.key}
                component={Link}
                to={item.link}
                className={clsx({
                  active: item.key === selectedKey,
                })}
                sx={{
                  color: item.key === selectedKey ? "white" : "inherit",
                  backgroundColor:
                    item.key === selectedKey
                      ? theme.palette.primary.main
                      : "transparent",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  marginRight: theme.spacing(2),
                  padding: theme.spacing(1),
                  borderRadius: theme.shape.borderRadius,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                {item.icon && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: theme.spacing(1),
                    }}
                  >
                    {item.icon}
                  </Box>
                )}
                <Typography variant="subtitle1">{item.label}</Typography>
              </Box>
            ))}
            <SearchModalButton /> {/* Add SearchModalButton here */}
          </Box>
        ) : (
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
            <StyledBranding>ETF Matcher</StyledBranding>
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
              <List>
                {menuItems.map((item) => (
                  <ListItem
                    button
                    key={item.key}
                    component={Link}
                    to={item.link}
                    onClick={toggleDrawer}
                    className={clsx({
                      active: item.key === selectedKey,
                    })}
                    sx={{
                      color: item.key === selectedKey ? "white" : "inherit",
                      backgroundColor:
                        item.key === selectedKey
                          ? theme.palette.primary.main
                          : "transparent",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </List>
            </Drawer>
            <Box sx={{ flexGrow: 1 }} />{" "}
            {/* Spacer to push the SearchModalButton to the right */}
            <SearchModalButton />
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
