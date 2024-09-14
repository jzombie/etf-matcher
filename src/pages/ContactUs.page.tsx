import React from "react";

import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { Box, Container, Grid2, Link, Typography } from "@mui/material";

import {
  PROJECT_AUTHOR_EMAIL,
  PROJECT_AUTHOR_LINKEDIN_URL,
  PROJECT_GITHUB_REPOSITORY,
  PROJECT_NAME,
} from "@src/constants";

import Section from "@components/Section";

export default function ContactUsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Section>
        <Typography variant="h4" align="center" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" align="center">
          Thank you for using {PROJECT_NAME}, a free and open-source tool
          designed to help you find the best ETFs. Please use the contact
          information to provide feedback, suggestions, or report any issues.
        </Typography>

        <Box sx={{ my: 5 }}>
          <Grid2 container spacing={3}>
            {/* Contact Info */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{PROJECT_AUTHOR_EMAIL}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <GitHubIcon color="primary" sx={{ mr: 1 }} />
                <Link
                  href={PROJECT_GITHUB_REPOSITORY}
                  target="_blank"
                  rel="noopener"
                >
                  <Typography variant="body1">
                    {PROJECT_GITHUB_REPOSITORY}
                  </Typography>
                </Link>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <LinkedInIcon color="primary" sx={{ mr: 1 }} />
                <Link
                  href={PROJECT_AUTHOR_LINKEDIN_URL}
                  target="_blank"
                  rel="noopener"
                >
                  <Typography variant="body1">
                    {PROJECT_AUTHOR_LINKEDIN_URL}
                  </Typography>
                </Link>
              </Box>
            </Grid2>
          </Grid2>
        </Box>
      </Section>
    </Container>
  );
}
