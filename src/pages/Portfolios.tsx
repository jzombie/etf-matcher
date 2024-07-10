import React from "react";
import { Button } from "antd";

export default function Portfolios() {
  return (
    <div>
      <Button>Create new Portfolio</Button>
      <hr />
      <div>
        <h2>My Portfolios</h2>
        ...
      </div>
    </div>
  );
}

// TODO: Make use of persistent session storage for portfolios, with ability to clear data
// TODO: Enable import / export of Portfolios
// TODO: Use Web Share (and Web Share Target [for PWAs]) API as potential transport agent
