import React from "react";

import { fireEvent, screen } from "@testing-library/react";

import { TickerBucket, TickerBucketTicker } from "@src/store";
import { vi } from "vitest";

import TickerQuantityFields, {
  TickerQuantityFieldsProps,
} from "@components/TickerBucketManager/TickerQuantityFields";

import { render } from "../../../../test/customRender";

const renderComponent = (props: Partial<TickerQuantityFieldsProps> = {}) => {
  const defaultProps: TickerQuantityFieldsProps = {
    onSaveableStateChange: vi.fn(),
    onDataChange: vi.fn(),
    omitShares: false,
  };
  return render(<TickerQuantityFields {...defaultProps} {...props} />);
};

describe("TickerQuantityFields", () => {
  it("should render the add button", () => {
    renderComponent();
    expect(
      screen.getByRole("button", { name: /add additional symbol/i }),
    ).toBeInTheDocument();
  });

  it("should add a new ticker field when add button is clicked", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: /add additional symbol/i }),
    );

    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
  });

  it("should update existing ticker", () => {
    const onDataChange = vi.fn();
    const existingTickers: TickerBucketTicker[] = [
      { tickerId: 1, symbol: "AAPL", quantity: 10 },
    ];
    renderComponent({
      tickerBucket: { tickers: existingTickers } as TickerBucket,
      onDataChange,
    });

    fireEvent.change(screen.getByLabelText(/shares/i), {
      target: { value: "20" },
    });

    expect(onDataChange).toHaveBeenCalledWith([
      { tickerId: 1, symbol: "AAPL", quantity: 20 },
    ]);
  });

  it("should remove ticker when delete button is clicked and confirmed in the dialog", () => {
    const onDataChange = vi.fn(); // Mock the onDataChange function to simulate data change
    const existingTickers: TickerBucketTicker[] = [
      { tickerId: 1, symbol: "AAPL", quantity: 10 },
    ];

    const { queryByDisplayValue, getByRole } = renderComponent({
      tickerBucket: { tickers: existingTickers } as TickerBucket,
      onDataChange,
    });

    // Ensure the ticker with value "AAPL" is in the document
    expect(queryByDisplayValue("AAPL")).toBeInTheDocument();

    // Click the delete button to open the modal
    const deleteButton = screen.getByTestId("delete-button--AAPL");
    fireEvent.click(deleteButton);

    // Simulate the modal opening and confirm the deletion by clicking "Delete"
    const confirmButton = getByRole("button", { name: /delete/i });
    fireEvent.click(confirmButton);

    // Check if onDataChange was called with the updated list (empty array)
    expect(onDataChange).toHaveBeenCalledWith([]);

    // After deletion, ensure the ticker with value "AAPL" is no longer in the document
    expect(queryByDisplayValue("AAPL")).not.toBeInTheDocument();
  });

  it("should disable add button by default for new buckets", () => {
    renderComponent();

    expect(
      screen.getByRole("button", { name: /add additional symbol/i }),
    ).toBeDisabled();
  });

  it("should enable add button by default for existing buckets", () => {
    const existingTickers: TickerBucketTicker[] = [
      { tickerId: 1, symbol: "AAPL", quantity: 10 },
    ];
    renderComponent({
      tickerBucket: { tickers: existingTickers } as TickerBucket,
    });

    expect(
      screen.getByRole("button", { name: /add additional symbol/i }),
    ).toBeEnabled();
  });

  it("should disable add button when a new ticker is being added", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: /add additional symbol/i }),
    );

    expect(
      screen.getByRole("button", { name: /add additional symbol/i }),
    ).toBeDisabled();
  });
});
