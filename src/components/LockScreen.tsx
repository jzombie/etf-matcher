import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormHelperText,
} from "@mui/material";
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password === PREVIEW_UNLOCK) {
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
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
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
    </Box>
  );
}
