import React from "react";
import { Layout as AntLayout, Menu } from "antd";
import { Outlet } from "react-router-dom";

const { Header, Content, Footer } = AntLayout;

export default function Layout() {
  return (
    <AntLayout>
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1">Home</Menu.Item>
          <Menu.Item key="2">About</Menu.Item>
        </Menu>
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
