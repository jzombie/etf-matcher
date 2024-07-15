import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { PREVIEW_UNLOCK } from "@src/store";

const LOCK_MESSAGE = "ETF Matcher is currently in limited preview.";

export type LockScreenProps = {
  onUnlock: () => void;
};

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setErrorMessage("");
  };

  const handleSubmit = () => {
    if (password === PREVIEW_UNLOCK) {
      onUnlock();
    } else {
      setErrorMessage("Incorrect password");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    } else if (event.key === "Escape") {
      setPassword("");
      setErrorMessage("");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "#1e3c72",
        // background: "linear-gradient(to bottom, #1e3c72, #2a5298)",
      }}
    >
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        Customize a virtual portfolio with potential fractional shares and find
        ETFs that closely match your investment goals.
      </Typography>
      <Typography
        mt={2}
        variant="h6"
        sx={{ color: "white", marginBottom: 4, textAlign: "center" }}
      >
        {LOCK_MESSAGE}
      </Typography>
      <TextField
        type="password"
        variant="outlined"
        placeholder="Enter Password"
        value={password}
        onChange={handlePasswordChange}
        onKeyDown={handleKeyDown}
        sx={{ marginBottom: 2, width: "250px" }}
      />
      {errorMessage && (
        <Typography
          variant="body1"
          sx={{
            color: "white",
            backgroundColor: "red",
            padding: "8px",
            borderRadius: "4px",
            marginBottom: 2,
            textAlign: "center",
          }}
        >
          {errorMessage}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ width: "250px" }}
      >
        Submit
      </Button>
    </Box>
  );
}
