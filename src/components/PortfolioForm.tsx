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
  symbol: string;
  weight: string;
}

const PortfolioForm: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([{ symbol: "", weight: "" }]);

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const values = [...assets];
    values[index][event.target.name as keyof Asset] = event.target.value;
    setAssets(values);
  };

  const handleAddFields = () => {
    setAssets([...assets, { symbol: "", weight: "" }]);
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
                    name="weight"
                    label="Weight"
                    variant="outlined"
                    fullWidth
                    required
                    value={asset.weight}
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
