import React, { useState } from "react";

import LockIcon from "@mui/icons-material/Lock";
import {
  Button,
  FormControl,
  FormHelperText,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import lockScreenImg from "@assets/lock.jpg";
import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
import FullViewport from "@layoutKit/FullViewport";
import Layout, { Content, Footer } from "@layoutKit/Layout";
import Padding from "@layoutKit/Padding";

import formatLocalTime from "@utils/formatLocalTime";

import { buildTime } from "../../public/buildTime.json";
import LogoNavButton from "./LogoNavButton";

const LOCK_MESSAGE = "ETF Matcher is currently in limited preview.";

export type LockScreenProps = {
  onUnlock: () => void;
};

// This component should be removed once launched
export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setErrorMessage("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Very simple mechanism to prevent general preview access (and easily bypassed)
    if (password === import.meta.env.VITE_PREVIEW_UNLOCK) {
      onUnlock();
    } else {
      setErrorMessage("Incorrect password");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setPassword("");
      setErrorMessage("");
    }
  };

  return (
    <FullViewport>
      <Full>
        <img
          src={lockScreenImg}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Full>
      <Cover style={{ backgroundColor: "rgba(0,0,0,.85)" }}>
        <Layout>
          <LogoNavButton />
          <Content>
            <Center>
              <Padding>
                <Typography variant="h5" sx={{ textAlign: "center" }}>
                  Customize a virtual portfolio with potential fractional shares
                  and find ETFs that closely match your investment goals.
                </Typography>

                <Typography
                  mt={2}
                  variant="h6"
                  sx={{ color: "white", marginBottom: 4, textAlign: "center" }}
                >
                  {LOCK_MESSAGE}
                </Typography>
              </Padding>
              <form onSubmit={handleSubmit}>
                <FormControl
                  sx={{ marginBottom: 2, width: "250px" }}
                  variant="outlined"
                >
                  <TextField
                    autoComplete="off"
                    type="password"
                    variant="outlined"
                    placeholder="Enter Password"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyDown={handleKeyDown}
                    sx={{ backgroundColor: "rgba(0,0,0,.5)" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#999" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {errorMessage && (
                    <FormHelperText error>{errorMessage}</FormHelperText>
                  )}
                </FormControl>
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{ width: "250px" }}
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </Center>
          </Content>
          <Footer>
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              Build time: {formatLocalTime(buildTime)}
            </Typography>
          </Footer>
        </Layout>
      </Cover>
    </FullViewport>
  );
}
