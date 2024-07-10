import React from "react";
import { Button } from "antd";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import heroImg from "@assets/hero.webp"; // Adjust the path as needed

export default function Home() {
  const { count } = useStoreStateReader(["count"]);

  return (
    <div>
      <section style={heroSectionStyle}>
        <div style={overlayStyle}>
          <div style={heroContentStyle}>
            <h1 style={heroTitleStyle}>Welcome to ETF Matcher</h1>
            <p style={heroSubtitleStyle}>
              Customize a virtual portfolio with potential fractional shares and
              find ETFs that closely match your investment goals.
            </p>
            <Button
              style={heroButtonStyle}
              type="primary"
              size="large"
              onClick={() => alert("TODO: Figure this out")}
            >
              Get Started
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
        <p>
          Disclaimer: The information provided on this platform is for
          informational purposes only and does not constitute financial,
          investment, or other professional advice. You should not rely on this
          information to make any investment decisions. Always consult with a
          qualified financial advisor before making any investment decisions. We
          do not guarantee the accuracy, completeness, or timeliness of any
          information provided and shall not be held liable for any errors or
          omissions, or for any loss or damage incurred as a result of using
          this information.
        </p>
        <div>{count}</div>
        <div>
          <Button onClick={() => store.PROTO_countEtfsPerExchange()}>
            PROTO::countEtfsPerExchange()
          </Button>
          <Button onClick={() => store.PROTO_getEtfHolderAssetCount()}>
            PROTO::getEtfHolderAssetCount()
          </Button>
        </div>
      </section>
    </div>
  );
}

const heroSectionStyle: React.CSSProperties = {
  position: "relative",
  height: "50vh",
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
  padding: "20px 100px",
};
