import React from "react";

import { render } from "@testing-library/react";

import { describe, expect, test } from "vitest";

import AutoScaler from "./AutoScaler";

describe("AutoScaler", () => {
  test("matches default snapshot", () => {
    const view = render(
      <AutoScaler>
        <div style={{ width: 500, height: 500 }}>AutoScaler child</div>
      </AutoScaler>,
    );

    expect(view.asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full auto_scaler"
        >
          <div
            class="content_wrap"
            style="visibility: hidden;"
          >
            <div
              style="width: 500px; height: 500px;"
            >
              AutoScaler child
            </div>
          </div>
        </div>
      </DocumentFragment>
    `);
  });

  test("matches snapshot with enlargement enabled", () => {
    const view = render(
      <AutoScaler enlargeable={true}>
        <div style={{ width: 500, height: 500 }}>AutoScaler child</div>
      </AutoScaler>,
    );

    expect(view.asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          <div
            class="full auto_scaler"
          >
            <div
              class="content_wrap"
              style="visibility: hidden;"
            >
              <div
                style="width: 500px; height: 500px;"
              >
                AutoScaler child
              </div>
            </div>
          </div>
        </DocumentFragment>
      `);
  });

  test("matches snapshot with enlargement disabled", () => {
    const view = render(
      <AutoScaler enlargeable={false}>
        <div style={{ width: 500, height: 500 }}>AutoScaler child</div>
      </AutoScaler>,
    );

    expect(view.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <div
        class="full auto_scaler"
      >
        <div
          class="content_wrap"
          style="visibility: hidden;"
        >
          <div
            style="width: 500px; height: 500px;"
          >
            AutoScaler child
          </div>
        </div>
      </div>
    </DocumentFragment>
  `);
  });
});
