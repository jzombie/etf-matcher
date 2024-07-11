import React, { useMemo } from "react";
import { Menu } from "antd";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import { Link, matchPath, useLocation } from "react-router-dom";

export default function HeaderMenu() {
  const location = useLocation();

  // Define the base paths for the main menu items
  const menuItems = useMemo(
    () => [
      {
        key: "/",
        label: (
          <Link to="/">
            <HomeOutlined title="Home" />
          </Link>
        ),
      },
      // { key: "/sectors", label: <Link to="/sectors">Sectors</Link> },
      { key: "/portfolios", label: <Link to="/portfolios">Portfolios</Link> },
      { key: "/watchlists", label: <Link to="/watchlists">Watchlists</Link> },
      {
        key: "/settings",
        label: (
          <Link to="/settings">
            <SettingOutlined title="Settings" />
          </Link>
        ),
      },
    ],
    []
  );

  const selectedKey = menuItems.find(
    (item) =>
      matchPath({ path: item.key, end: true }, location.pathname) ||
      matchPath({ path: `${item.key}/*`, end: false }, location.pathname)
  )?.key;

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={selectedKey ? [selectedKey] : []}
      items={menuItems}
      style={{ flex: 1 }}
    />
  );
}
