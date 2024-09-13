import React from "react";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Button } from "@mui/material";

import heroImg from "@assets/hero.webp";
import Scrollable from "@layoutKit/Scrollable";
import { INVESTMENT_DISCLAIMER, PROJECT_DESCRIPTION } from "@src/constants";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function HomePage() {
  // Home page; no title override
  usePageTitleSetter(null);

  const { isSearchModalOpen } = useStoreStateReader(["isSearchModalOpen"]);

  const handleGetStarted = () => {
    store.setState({ isSearchModalOpen: true });
  };

  return (
    <Scrollable>
      <section style={heroSectionStyle}>
        <div style={overlayStyle}>
          <div style={heroContentStyle}>
            <h1 style={heroTitleStyle}>Welcome to ETF Matcher</h1>
            <p style={heroSubtitleStyle}>{PROJECT_DESCRIPTION}</p>
            <Button
              variant="contained"
              style={heroButtonStyle}
              onClick={handleGetStarted}
              disabled={isSearchModalOpen}
              startIcon={<TrendingUpIcon />}
            >
              {store.isFreshSession ? "Get Started" : "Continue"}
            </Button>
          </div>
        </div>
        <img style={heroImageStyle} src={heroImg} alt="ETF Matcher" />
      </section>
      <section style={infoSectionStyle}>
        <p style={{ fontWeight: "bold" }}>
          After you find the ETFs that most closely match your investment goals,
          trade them on your platform of choice!
        </p>
        <p>{INVESTMENT_DISCLAIMER}</p>
      </section>
    </Scrollable>
  );
}

const heroSectionStyle: React.CSSProperties = {
  position: "relative",
  height: 500,
  width: "100%",
  marginBottom: "50px",
  overflow: "hidden",
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  padding: 8,
  backgroundColor: "rgba(0, 0, 0, 0.8)", // Translucent overlay
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const heroContentStyle: React.CSSProperties = {
  color: "#fff",
  textAlign: "center" as const,
  maxWidth: "600px",
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: "3rem",
  fontWeight: "bold",
  marginBottom: "20px",
};

const heroSubtitleStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  marginBottom: "30px",
};

const heroButtonStyle: React.CSSProperties = {
  fontSize: "1.2rem",
};

const heroImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
  zIndex: -1,
};

const infoSectionStyle: React.CSSProperties = {
  padding: "20px 20px",
  // boxSizing: "border-box",
};
