import React, { useMemo, useRef, useState } from "react";

import {
  Assessment as AssessmentIcon,
  ContactMail as ContactMailIcon,
  Home,
  ImportExport as ImportExportIcon,
  ListAlt as ListAltIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Badge,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";

import clsx from "clsx";
import { Link, matchPath, useLocation } from "react-router-dom";

import LogoNavButton from "@components/LogoNavButton";
import SearchModalButton from "@components/SearchModalButton";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import useTickerBucketImportExportContext from "@hooks/useTickerBucketImportExportContext";

import SlidingBackground from "./HeaderMenu.SlidingBackground";

const MIN_HORIZONTAL_WIDTH: number = 1000;

export default function HeaderMenu() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(
    `@media (min-width:${MIN_HORIZONTAL_WIDTH}px)`,
  );

  const { openImportExportModal } = useTickerBucketImportExportContext();

  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const { totalPortfolioBuckets, totalWatchlistBuckets } = useMemo(() => {
    const totalPortfolioBuckets = tickerBuckets.reduce((prev, curr) => {
      return curr.type === "portfolio" ? prev + 1 : prev;
    }, 0);

    const totalWatchlistBuckets = tickerBuckets.reduce((prev, curr) => {
      return curr.type === "watchlist" ? prev + 1 : prev;
    }, 0);

    return { totalPortfolioBuckets, totalWatchlistBuckets };
  }, [tickerBuckets]);

  const menuRef = useRef<HTMLDivElement>(null);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  // TODO: Consider refactoring so this isn't hardcoded here
  const menuItems = useMemo(
    () => [
      { key: "/", label: "Home", icon: <Home fontSize="small" />, link: "/" },
      {
        key: "/portfolios",
        link: "/portfolios",
        label: "Portfolios",
        icon: <AssessmentIcon fontSize="small" />,
        badgeContent: totalPortfolioBuckets,
      },
      {
        key: "/watchlists",
        link: "/watchlists",
        label: "Watchlists",
        icon: <ListAltIcon fontSize="small" />,
        badgeContent: totalWatchlistBuckets,
      },
      {
        key: "/import-export",
        link: "#",
        label: "Import/Export",
        icon: <ImportExportIcon fontSize="small" />,
        onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
          // Prevent the default anchor link behavior
          event.preventDefault();

          openImportExportModal();
        },
      },
      {
        key: "/settings",
        link: "/settings",
        label: "Settings",
        icon: <SettingsIcon fontSize="small" />,
      },
      {
        key: "/contact",
        link: "/contact",
        label: "Contact",
        icon: <ContactMailIcon fontSize="small" />,
      },
    ],
    [totalPortfolioBuckets, totalWatchlistBuckets, openImportExportModal],
  );

  // TODO: Consider refactoring so this isn't hardcoded here
  const selectedKey = useMemo(() => {
    if (
      matchPath(
        { path: "/portfolio/:bucketName", end: false },
        location.pathname,
      )
    ) {
      return "/portfolios";
    }
    if (
      matchPath(
        { path: "/watchlist/:bucketName", end: false },
        location.pathname,
      )
    ) {
      return "/watchlists";
    }
    return menuItems.find(
      (item) =>
        matchPath({ path: item.key, end: true }, location.pathname) ||
        matchPath({ path: `${item.key}/*`, end: false }, location.pathname),
    )?.key;
  }, [location.pathname, menuItems]);

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
                onClick={item.onClick}
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
                {item.icon}
                {["/portfolios", "/watchlists"].includes(item.key) ? (
                  <Badge badgeContent={item.badgeContent} color="secondary">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ marginLeft: 0.5 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Badge>
                ) : (
                  <Typography variant="subtitle1" sx={{ marginLeft: 0.5 }}>
                    {item.label}
                  </Typography>
                )}
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
                    onClick={(evt) => {
                      toggleDrawer();

                      if (typeof item.onClick === "function") {
                        item.onClick(evt);
                      }
                    }}
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
                      {["/portfolios", "/watchlists"].includes(item.key) ? (
                        <Badge
                          badgeContent={item.badgeContent}
                          color="secondary"
                        >
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
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
