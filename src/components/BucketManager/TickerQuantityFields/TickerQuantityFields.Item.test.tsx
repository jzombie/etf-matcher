import React from "react";

import { fireEvent, screen, within } from "@testing-library/react";

import { TickerBucketTicker } from "@src/store";
import type { RustServiceTickerSearchResult } from "@src/types";
import { vi } from "vitest";

import TickerQuantityFieldsItem, {
  TickerQuantityFieldsItemProps,
} from "@components/BucketManager/TickerQuantityFields/TickerQuantityFields.Item";
import TickerSearchModal from "@components/TickerSearchModal";

import { render } from "../../../../test/customRender";

// Mock the TickerSearchModal component
vi.mock("@components/TickerSearchModal", () => ({
  __esModule: true,
  default: ({
    open,
    onSelectTicker,
  }: {
    open: boolean;
    onSelectTicker: (ticker: RustServiceTickerSearchResult) => void;
  }) => (
    <div data-testid="ticker-search-modal">
      <button
        onClick={() =>
          onSelectTicker({
            ticker_id: 123,
            symbol: "AAPL",
            company_name: "Apple",
            exchange_short_name: "NASDAQ",
          })
        }
      >
        Select Ticker
      </button>
    </div>
  ),
}));

const renderComponent = (
  props: Partial<TickerQuantityFieldsItemProps> = {},
) => {
  const defaultProps: TickerQuantityFieldsItemProps = {
    existingBucketTickers: [],
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onCancel: vi.fn(),
    omitShares: false,
  };
  return render(<TickerQuantityFieldsItem {...defaultProps} {...props} />);
};

describe("TickerQuantityFieldsItem", () => {
  it("should render the component", () => {
    renderComponent();
    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
  });

  it("should show error message for invalid number format", () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/shares/i), {
      target: { value: "invalid" },
    });

    expect(screen.getByText(/invalid number format/i)).toBeInTheDocument();
  });

  it("should call onCancel when delete button is clicked if tickers exist", () => {
    const onCancel = vi.fn();
    renderComponent({
      onCancel,
      existingBucketTickers: [
        {
          tickerId: 1,
          symbol: "AAPL",
          quantity: 10,
        } as TickerBucketTicker,
      ],
    });

    const deleteButton = screen.queryByTestId("delete-button");
    expect(deleteButton).toBeInTheDocument();

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(onCancel).toHaveBeenCalled();
    }
  });

  it("should set bucketTicker when a ticker is selected", () => {
    const onUpdate = vi.fn();

    // Render the component with the mocked onUpdate handler
    render(
      <TickerQuantityFieldsItem
        onUpdate={onUpdate}
        existingBucketTickers={[]}
      />,
    );

    // Open the ticker search modal by clicking the symbol field
    fireEvent.click(screen.getByLabelText(/symbol/i));

    // Click the mock button to simulate ticker selection
    fireEvent.click(screen.getByText(/select ticker/i));

    // Assert that onUpdate was called with the correct values
    expect(onUpdate).toHaveBeenCalledWith({
      tickerId: 123,
      symbol: "AAPL",
      exchangeShortName: "NASDAQ",
      quantity: 1,
    });

    // Further assertions, if needed, for other state changes
    expect(screen.getByLabelText(/symbol/i)).toHaveValue("AAPL");
  });
});
