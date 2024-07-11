import React, { useState } from "react";
import { Menu, Drawer, Button } from "antd";
import { HomeOutlined, SettingOutlined, MenuOutlined } from "@ant-design/icons";
import { Link, matchPath, useLocation } from "react-router-dom";

import useWindowSize from "@hooks/useWindowSize";

const MIN_DESKTOP_WINDOW_WIDTH = 600;

export default function HeaderMenu() {
  const location = useLocation();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const { width: windowWidth } = useWindowSize();

  const showDrawer = () => setIsDrawerVisible(true);
  const hideDrawer = () => setIsDrawerVisible(false);

  const menuItems = [
    {
      key: "/",
      label: (
        <Link to="/" onClick={hideDrawer}>
          <HomeOutlined title="Home" />
          <span>Home</span>
        </Link>
      ),
    },
    {
      key: "/portfolios",
      label: (
        <Link to="/portfolios" onClick={hideDrawer}>
          Portfolios
        </Link>
      ),
    },
    {
      key: "/watchlists",
      label: (
        <Link to="/watchlists" onClick={hideDrawer}>
          Watchlists
        </Link>
      ),
    },
    {
      key: "/settings",
      label: (
        <Link to="/settings" onClick={hideDrawer}>
          <SettingOutlined title="Settings" />
          <span>Settings</span>
        </Link>
      ),
    },
  ];

  const selectedKey = menuItems.find(
    (item) =>
      matchPath({ path: item.key, end: true }, location.pathname) ||
      matchPath({ path: `${item.key}/*`, end: false }, location.pathname)
  )?.key;

  return (
    <>
      {windowWidth < MIN_DESKTOP_WINDOW_WIDTH ? (
        <>
          <div className="menu-icon">
            <Button icon={<MenuOutlined />} onClick={showDrawer} />
          </div>
          <Drawer
            title="Menu"
            placement="left"
            onClose={hideDrawer}
            open={isDrawerVisible}
          >
            <Menu
              mode="vertical"
              selectedKeys={selectedKey ? [selectedKey] : []}
              items={menuItems}
            />
          </Drawer>
        </>
      ) : (
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={menuItems}
          className="desktop-menu"
        />
      )}
    </>
  );
}
