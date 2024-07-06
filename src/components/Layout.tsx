import React from "react";
import { Layout as AntLayout, Menu, Button } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
// import { SaveOutlined } from "@ant-design/icons";
// import useStoreStateReader from "@hooks/useStoreStateReader";

const { Header, Content, Footer } = AntLayout;

export default function Layout() {
  const location = useLocation();
  const selectedKey = location.pathname === "/" ? "/" : location.pathname;

  // const { isDirtyState } = useStoreStateReader("isDirtyState");

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
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
          style={{ flex: 1 }}
        />
        {
          // TODO: Add save button
          /* <Button
          type="primary"
          icon={<SaveOutlined />}
          style={{ marginLeft: "auto" }}
          disabled={!isDirtyState}
        >
          Save
        </Button> */
        }
      </Header>
      <Content style={{ padding: "10px 10px" }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "center" }}>©2024 Created by You</Footer>
    </AntLayout>
  );
}
