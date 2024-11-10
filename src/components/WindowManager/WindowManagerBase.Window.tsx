import React, { useContext } from "react";

import { useTheme } from "@mui/material/styles";

import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
import {
  MosaicBranch,
  MosaicContext,
  MosaicWindow,
} from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import customLogger from "@utils/customLogger";

import "./mosaic-custom-overrides.css";

export type WindowProps = {
  id: string;
  path: MosaicBranch[];
  totalWindowCount: number;
  content: React.ReactNode; // Dynamic content passed in
  isResizing: boolean;
};

// TODO: Render the children in a `portal` view so that they can be re-parented
// without losing state. This is especially beneficial for advanced charting
// components.
export default function Window({ id, path, content, isResizing }: WindowProps) {
  const theme = useTheme();

  const windowStyles = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
  };

  const toolbarStyles = {
    backgroundColor: theme.palette.background.default,
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
    maxWidth: "300px", // Adjust max-width as needed
  };

  return (
    <MosaicWindow<string>
      title={`Window ${id}`}
      path={path}
      onDragStart={() => customLogger.debug("MosaicWindow.onDragStart")}
      onDragEnd={(type) => customLogger.debug("MosaicWindow.onDragEnd", type)}
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
        {/* Render the dynamic content passed from WindowManager */}
        {content}
        <Cover clickThrough={!isResizing} />
      </Full>
    </MosaicWindow>
  );
}

// RemoveButton to remove the window
type RemoveButtonProps = {
  path: MosaicBranch[];
};

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
