/* eslint-disable */
import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

interface Asset {
  // TODO: Needs to account for exchange! The only way to do this effectively is tie this into the symbol search mechanism.
  symbol: string;
  shares: number;
}

const PortfolioForm: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([{ symbol: "", shares: 0 }]);

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const values = [...assets];

    if (name === "shares") {
      values[index].shares = parseInt(value, 10);
    } else if (name === "symbol") {
      values[index].symbol = value;
    }
    setAssets(values);
  };

  const handleAddFields = () => {
    setAssets([...assets, { symbol: "", shares: 1 }]);
  };

  const handleRemoveFields = (index: number) => {
    const values = [...assets];
    values.splice(index, 1);
    setAssets(values);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form Data:", assets);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Custom Portfolio
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {assets.map((asset, index) => (
              <React.Fragment key={index}>
                <Grid item xs={5}>
                  <TextField
                    name="symbol"
                    label="Symbol"
                    variant="outlined"
                    fullWidth
                    required
                    value={asset.symbol}
                    onChange={(event) => handleInputChange(index, event)}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name="shares"
                    label="Shares"
                    variant="outlined"
                    fullWidth
                    required
                    type="number"
                    value={asset.shares}
                    onChange={(event) => handleInputChange(index, event)}
                  />
                </Grid>
                <Grid
                  item
                  xs={2}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <IconButton onClick={() => handleRemoveFields(index)}>
                    <RemoveCircleOutlineIcon color="error" />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddFields}
              >
                Add Symbol
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default PortfolioForm;
