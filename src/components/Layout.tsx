import React from "react";
import { Layout as AntLayout, Menu } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Content, Footer } = AntLayout;

export default function Layout() {
  const location = useLocation();
  const selectedKey = location.pathname === "/" ? "/" : location.pathname;

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
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
      <Content style={{ padding: "10px 10px" }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "center" }}>©2024 Created by You</Footer>
    </AntLayout>
  );
}
