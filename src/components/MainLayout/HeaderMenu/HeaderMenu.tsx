import React, { useState, useRef } from "react";
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Badge,
} from "@mui/material";
import {
  Home,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Assessment as AssessmentIcon,
  ListAlt as ListAltIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Link, useLocation, matchPath } from "react-router-dom";
import SearchModalButton from "@components/SearchModalButton";
import clsx from "clsx";
import { styled } from "@mui/system";
import LogoNavButton from "@components/LogoNavButton";

import SlidingBackground from "./HeaderMenu.SlidingBackground";

import store from "@src/store";

export default function HeaderMenu() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery("@media (min-width:800px)");

  const menuRef = useRef<HTMLDivElement>(null);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const menuItems = [
    { key: "/", label: "Home", icon: <Home fontSize="small" />, link: "/" },
    {
      key: "/portfolios",
      label: "Portfolios",
      icon: <AssessmentIcon fontSize="small" />,
      link: "/portfolios",
    },
    {
      key: "/watchlists",
      label: "Watchlists",
      icon: <ListAltIcon fontSize="small" />,
      link: "/watchlists",
    },
    {
      key: "/settings",
      label: "Settings",
      icon: <SettingsIcon fontSize="small" />,
      link: "/settings",
    },
  ];

  const selectedKey = menuItems.find(
    (item) =>
      matchPath({ path: item.key, end: true }, location.pathname) ||
      matchPath({ path: `${item.key}/*`, end: false }, location.pathname)
  )?.key;

  const shouldHighlightSearchButton = !selectedKey;

  const DesktopStyledLogoBranding = styled(Typography)(({ theme }) => ({
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    fontSize: "1.5rem",
    marginRight: theme.spacing(2),
    color: "white",
    flexGrow: 1,
  }));

  const MobileStyledLogoBranding = styled(Typography)(() => ({
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    fontSize: "1.5rem",
    color: "white",
  }));

  return (
    <AppBar position="relative">
      <Toolbar>
        {isDesktop ? (
          <Box
            ref={menuRef}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexGrow: 1,
              position: "relative",
            }}
          >
            <SlidingBackground menuRef={menuRef} selectedKey={selectedKey} />
            <DesktopStyledLogoBranding>
              <LogoNavButton />
            </DesktopStyledLogoBranding>
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
                  position: "relative",
                  zIndex: 1,
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
                <Typography variant="subtitle1">{item.label}</Typography>
                {
                  // TODO: Only show badges on "Portfolios" and "Watchlists", indicating new items that have not been
                }
                <Badge badgeContent={4} color="secondary">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: theme.spacing(1),
                    }}
                  >
                    {item.icon}
                  </Box>
                </Badge>
              </Box>
            ))}
            <SearchModalButton highlight={shouldHighlightSearchButton} />
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
            {!drawerOpen && (
              <MobileStyledLogoBranding>
                <LogoNavButton />
              </MobileStyledLogoBranding>
            )}
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer}
              sx={{ "& .MuiDrawer-paper": { width: "240px" } }}
            >
              <MobileStyledLogoBranding sx={{ padding: 1 }}>
                <LogoNavButton onClick={toggleDrawer} />
              </MobileStyledLogoBranding>
              <List>
                {menuItems.map((item) => (
                  <ListItem
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
                    <ListItemIcon
                      sx={{
                        color: item.key === selectedKey ? "white" : "inherit",
                      }}
                    >
                      <Badge badgeContent={4} color="secondary">
                        {item.icon}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
                <ListItem
                  sx={{
                    color: "white",

                    backgroundColor: shouldHighlightSearchButton
                      ? theme.palette.primary.main
                      : "transparent",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    toggleDrawer();
                    store.setState({ isSearchModalOpen: true });
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "white",
                    }}
                  >
                    <SearchIcon />
                  </ListItemIcon>
                  <ListItemText primary="Search" />
                </ListItem>
              </List>
            </Drawer>
            <Box sx={{ flexGrow: 1 }} />
            <SearchModalButton highlight={shouldHighlightSearchButton} />
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
