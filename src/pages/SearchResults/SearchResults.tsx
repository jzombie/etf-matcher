import React from "react";

// import { Classes, HTMLSelect } from "@blueprintjs/core";
// import "@blueprintjs/core/lib/css/blueprint.css";
// import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import Full from "@layoutKit/Full";
// import clsx from "clsx";
import { Mosaic, MosaicBranch, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

// import "./app.css";

// const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
//   a: <div>Left Window</div>,
//   b: <div>Top Right Window</div>,
//   c: <div>Bottom Right Window</div>,
// };

export default function SearchResults() {
  return (
    <Full id="app" style={{ backgroundColor: "gray" }}>
      <div style={{ backgroundColor: "black", width: "100%", height: 500 }}>
        <Mosaic<string>
          renderTile={(id, path) => (
            <ExampleWindow id={id} path={path} totalWindowCount={3} />
          )}
          initialValue={{
            direction: "column",
            first: "a",
            second: {
              direction: "row",
              first: "b",
              second: "c",
            },
            splitPercentage: 40,
          }}
          // className={clsx("mosaic-blueprint-theme", Classes.DARK)}
        />
      </div>
    </Full>
  );
}

interface ExampleWindowProps {
  id: string;
  path: MosaicBranch[];
  totalWindowCount: number;
}

const ExampleWindow = ({ id, path, totalWindowCount }: ExampleWindowProps) => {
  return (
    <MosaicWindow<string>
      title={`Window ${id}`}
      // createNode={() => totalWindowCount + 1}
      path={path}
      onDragStart={() => console.log("MosaicWindow.onDragStart")}
      onDragEnd={(type) => console.log("MosaicWindow.onDragEnd", type)}
      // renderToolbar={
      //   id === "b"
      //     ? () => <div className="toolbar-example">Custom Toolbar</div>
      //     : null
      // }
    >
      <div style={{ backgroundColor: "yellow", color: "#000" }}>
        test {totalWindowCount}
      </div>
    </MosaicWindow>
  );
};
