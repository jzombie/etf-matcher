import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Home, Settings, Menu as MenuIcon } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

export default function HeaderMenu() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { key: "/", label: "Home", icon: <Home />, link: "/" },
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
      icon: <Settings />,
      link: "/settings",
    },
  ];

  return (
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
            >
              {/*item.icon && <ListItemIcon>{item.icon}</ListItemIcon>
               */}
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
