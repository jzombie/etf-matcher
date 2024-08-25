/* eslint-disable */
import React, { useState } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import PortfolioFormItem from "./PortfolioForm.Item";

// TODO: Refactor; rename
interface Asset {
  // TODO: Needs to account for exchange! The only way to do this effectively is tie this into the symbol search mechanism.
  symbol: string;
  shares: number;
}

const PortfolioForm: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([{ symbol: "", shares: 0 }]);

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const values = [...assets];

    if (name === "shares") {
      values[index].shares = parseInt(value, 10);
    } else if (name === "symbol") {
      // TODO: Implement query symbols while typing
      //  |
      //  |_ Perform a regular symbol search
      // store.PROTO_getTickerIdsWithSymbol(value);

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
              // TODO: Use `tickerId` for index
              <PortfolioFormItem key={index} />
            ))}
            <Grid item xs={12}>
              {
                // TODO: Prevent add unless no current symbol is being edited, and there is at least one populated symbol
              }
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
                disabled
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
