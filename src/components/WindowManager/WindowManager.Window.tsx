import React, { useContext, useEffect } from "react";

import { useTheme } from "@mui/material/styles";

import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
import {
  MosaicBranch,
  MosaicContext,
  MosaicWindow,
} from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import "./mosaic-custom-overrides.css";

export type WindowProps = {
  id: string;
  path: MosaicBranch[];
  totalWindowCount: number;
  content: React.ReactNode; // Dynamic content passed in
  isResizing: boolean;
};

export default function Window({
  id,
  path,
  totalWindowCount,
  content,
  isResizing,
}: WindowProps) {
  const theme = useTheme();

  const windowStyles = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
  };

  const toolbarStyles = {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  };

  const toolbarTitleStyles = {
    fontWeight: "bold",
    whiteSpace: "nowrap", // Prevent wrapping
    overflow: "hidden", // Hide overflowed text
    textOverflow: "ellipsis", // Add ellipsis if truncated
    maxWidth: "150px", // Adjust max-width as needed
  };

  return (
    <MosaicWindow<string>
      title={`Window ${id}`}
      path={path}
      onDragStart={() => console.log("MosaicWindow.onDragStart")}
      onDragEnd={(type) => console.log("MosaicWindow.onDragEnd", type)}
      renderToolbar={() => (
        <div style={toolbarStyles}>
          <span style={toolbarTitleStyles}>{id}</span>
          <div>
            <RemoveButton path={path} />
          </div>
        </div>
      )}
    >
      <Full style={windowStyles}>
        {
          // The dynamic `Cover clickthrough` helps prevent an issue where
          // window content that contains pointer listeners from intercepting
          // pointer events while the user is resizing regions.
        }
        <Cover clickThrough={!isResizing}>
          {/* Render the dynamic content passed from WindowManager */}
          {content}
        </Cover>
      </Full>
    </MosaicWindow>
  );
}

// RemoveButton to remove the window
interface RemoveButtonProps {
  path: MosaicBranch[];
}

function RemoveButton({ path }: RemoveButtonProps) {
  const { mosaicActions } = useContext(MosaicContext);

  return (
    <button
      onClick={() => mosaicActions.remove(path)}
      style={{
        backgroundColor: "#f50057",
        color: "#fff",
        border: "none",
        padding: "5px 10px",
        cursor: "pointer",
      }}
    >
      X
    </button>
  );
}
