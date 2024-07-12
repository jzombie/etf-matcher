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

export default function HeaderMenu() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDesktop = useMediaQuery("@media (min-width:600px)");

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

  return (
    <AppBar position="relative">
      <Toolbar>
        {isDesktop ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
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
          </>
        )}
        <Box sx={{ flexGrow: 1 }} />{" "}
        {/* Spacer to push the SearchModalButton to the right */}
        <SearchModalButton />
      </Toolbar>
    </AppBar>
  );
}
