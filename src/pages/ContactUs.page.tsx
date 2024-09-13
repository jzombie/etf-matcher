import React from "react";

import ContactMailIcon from "@mui/icons-material/ContactMail";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import Section from "@components/Section";

// TODO: Finish implementing
// TODO: Include contact information on lockscreen?
export default function ContactUsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Section>
        <Typography variant="h4" align="center" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          We&apos;d love to hear from you! Whether you have a question about
          features, pricing, or anything else, our team is ready to answer all
          your questions.
        </Typography>

        <Box sx={{ my: 5 }}>
          <Grid container spacing={3}>
            {/* Contact Info */}
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  1234 Elm St, Springfield, USA
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">(123) 456-7890</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">contact@etfmatcher.com</Typography>
              </Box>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Your Name"
                variant="outlined"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Your Email"
                variant="outlined"
                type="email"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Your Message"
                variant="outlined"
                multiline
                rows={4}
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<ContactMailIcon />}
                sx={{ mt: 2 }}
              >
                Send Message
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Section>
    </Container>
  );
}
