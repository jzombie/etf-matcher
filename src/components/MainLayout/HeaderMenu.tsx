import React, { useState, useRef, useEffect } from "react";
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

import store from "@src/store";

interface SlidingBackgroundProps {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: string;
  visible: boolean;
  transitionEnabled: boolean;
}

const SlidingBackground = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "left" &&
    prop !== "top" &&
    prop !== "width" &&
    prop !== "height" &&
    prop !== "borderRadius" &&
    prop !== "visible" &&
    prop !== "transitionEnabled",
})<SlidingBackgroundProps>(
  ({
    theme,
    left,
    top,
    width,
    height,
    borderRadius,
    visible,
    transitionEnabled,
  }) => ({
    position: "absolute",
    top,
    left,
    width,
    height,
    backgroundColor: visible ? theme.palette.primary.main : "transparent",
    transition: transitionEnabled
      ? "left 0.3s ease, width 0.3s ease, top 0.3s ease, background-color 0.3s ease"
      : "none",
    zIndex: 0,
    borderRadius,
  })
);

export default function HeaderMenu() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery("@media (min-width:800px)");
  const [isResizing, setIsResizing] = useState(false);

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

  const menuRef = useRef<HTMLDivElement>(null);
  const [backgroundProps, setBackgroundProps] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderRadius: "0px",
    visible: false,
    transitionEnabled: true,
  });

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      setIsResizing(true);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsResizing(false);
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    const updateBackgroundPosition = () => {
      if (isDesktop && menuRef.current && selectedKey) {
        const selectedItem = menuRef.current.querySelector(
          `.active`
        ) as HTMLElement;
        if (selectedItem) {
          const {
            offsetLeft: left,
            offsetTop: top,
            offsetWidth: width,
            offsetHeight: height,
          } = selectedItem;
          const borderRadius =
            window.getComputedStyle(selectedItem).borderRadius;
          setBackgroundProps({
            left,
            top,
            width,
            height,
            borderRadius,
            visible: true,
            transitionEnabled: !isResizing,
          });
        }
      } else {
        setBackgroundProps((prev) => ({
          ...prev,
          visible: false,
          transitionEnabled: true,
        }));
      }
    };

    updateBackgroundPosition(); // Update position on mount

    window.addEventListener("resize", updateBackgroundPosition);

    return () => {
      window.removeEventListener("resize", updateBackgroundPosition);
    };
  }, [isDesktop, selectedKey, isResizing]);

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
            <SlidingBackground
              left={backgroundProps.left}
              top={backgroundProps.top}
              width={backgroundProps.width}
              height={backgroundProps.height}
              borderRadius={backgroundProps.borderRadius}
              visible={backgroundProps.visible}
              transitionEnabled={backgroundProps.transitionEnabled}
            />
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
