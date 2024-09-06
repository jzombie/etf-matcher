import React from "react";

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import Full from "@layoutKit/Full";
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
          // renderTile={(id) => ELEMENT_MAP[id]}
          renderTile={(count, path) => (
            <ExampleWindow count={count} path={path} totalWindowCount={3} />
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
        />
      </div>
    </Full>
  );
}

interface ExampleWindowProps {
  count: number;
  path: MosaicBranch[];
  totalWindowCount: number;
}

const ExampleWindow = ({
  count,
  path,
  totalWindowCount,
}: ExampleWindowProps) => {
  const adContainer = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (adContainer.current == null) {
      return;
    }

    const script = window.document.createElement("script");

    script.src =
      "//cdn.carbonads.com/carbon.js?serve=CEAIEK3E&placement=nomcoptergithubio";
    script.async = true;
    script.type = "text/javascript";
    script.id = "_carbonads_js";

    adContainer.current.appendChild(script);
  }, []);

  return (
    <MosaicWindow<number>
      // additionalControls={count === 3 ? additionalControls : EMPTY_ARRAY}
      title={`Window ${count}`}
      createNode={() => totalWindowCount + 1}
      path={path}
      onDragStart={() => console.log("MosaicWindow.onDragStart")}
      onDragEnd={(type) => console.log("MosaicWindow.onDragEnd", type)}
      renderToolbar={
        count === 2
          ? () => <div className="toolbar-example">Custom Toolbar</div>
          : null
      }
    >
      <div className="example-window">
        <h1>{`Window ${count}`}</h1>
        {count === 3 && <div className="ad-container" ref={adContainer} />}
      </div>
    </MosaicWindow>
  );
};
