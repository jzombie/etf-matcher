import React, { useRef } from "react";

import Typography from "@mui/material/Typography";

import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Layout, { Content, Footer } from "@layoutKit/Layout";

import useElementSize from "@hooks/useElementSize";

export default function DimensionOverlayDebugger() {
  const coverRef = useRef<HTMLDivElement>(null);
  const coverSize = useElementSize(coverRef);

  return (
    <Cover ref={coverRef} style={{ backgroundColor: "rgba(0,0,0,.8)" }}>
      <Layout>
        <Content>
          <Center>
            <Typography sx={{ fontWeight: "bold" }}>
              {coverSize.width} x {coverSize.height}
            </Typography>
          </Center>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          <Typography variant="caption">[DimensionOverlayDebugger]</Typography>
        </Footer>
      </Layout>
    </Cover>
  );
}
