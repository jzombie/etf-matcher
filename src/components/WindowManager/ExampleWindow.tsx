import React, { useContext } from "react";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import {
  MosaicBranch,
  MosaicContext,
  MosaicWindow,
} from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

// ExampleWindow Props now include dynamic content
interface ExampleWindowProps {
  id: string;
  path: MosaicBranch[];
  totalWindowCount: number;
  content: React.ReactNode; // Dynamic content passed in
}

// The window component
const ExampleWindow = ({
  id,
  path,
  totalWindowCount,
  content,
}: ExampleWindowProps) => {
  const theme = useTheme();

  const windowStyles = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    height: "100%",
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

  return (
    <MosaicWindow<string>
      title={`Window ${id}`}
      path={path}
      onDragStart={() => console.log("MosaicWindow.onDragStart")}
      onDragEnd={(type) => console.log("MosaicWindow.onDragEnd", type)}
      renderToolbar={() => (
        <div style={toolbarStyles}>
          <span>{id}</span>
          <div>
            <RemoveButton path={path} />
          </div>
        </div>
      )}
    >
      <div style={windowStyles}>
        {/* Render the dynamic content passed from WindowManager */}
        {content}
      </div>
    </MosaicWindow>
  );
};

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

export default ExampleWindow;
export type { ExampleWindowProps };
