import React from "react";
import { Layout as AntLayout, Menu, Button } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
// import { SaveOutlined } from "@ant-design/icons";
import useStoreStateReader from "@hooks/useStoreStateReader";

const { Header, Content, Footer } = AntLayout;

export default function Layout() {
  const location = useLocation();
  const selectedKey = location.pathname === "/" ? "/" : location.pathname;

  const { prettyDataBuildTime, isDirtyState } = useStoreStateReader([
    "prettyDataBuildTime",
    "isDirtyState",
  ]);

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
      <Content
        style={{
          padding: "10px 10px",
          height: 0, // Needs a height to force this container to stretch
          display: "flex",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "left", padding: 0, margin: 0 }}>
        <span>
          {prettyDataBuildTime ? `Date build time: ${prettyDataBuildTime}` : ""}
        </span>
        {" | "}
        <span>{isDirtyState ? "Not Saved" : "Saved"}</span>
      </Footer>
    </AntLayout>
  );
}
