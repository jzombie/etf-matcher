import React from "react";
import { Layout as AntLayout, Menu } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Content, Footer } = AntLayout;

export default function Layout() {
  const location = useLocation();
  const selectedKey = location.pathname === "/" ? "/" : location.pathname;

  return (
    <AntLayout>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={[
            {
              key: "/",
              label: <Link to="/">Home</Link>,
            },
            {
              key: "/about",
              label: <Link to="/about">About</Link>,
            },
          ]}
        />
      </Header>
      <Content style={{ padding: "0 50px", marginTop: 64 }}>
        <div style={{ padding: 24, minHeight: 380 }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>©2024 Created by You</Footer>
    </AntLayout>
  );
}
