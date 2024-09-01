import React from "react";

import { fireEvent, screen } from "@testing-library/react";

import { TickerBucketTicker } from "@src/store";
import { vi } from "vitest";

import TickerQuantityFieldsItem, {
  TickerQuantityFieldsItemProps,
} from "@components/BucketManager/TickerQuantityFields/TickerQuantityFields.Item";

import { render } from "../../../../test/customRender";

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

  it("should call onDelete when the delete button is clicked if modifying existing item", () => {
    const onDelete = vi.fn();

    renderComponent({
      onDelete,
      initialBucketTicker: {
        tickerId: 1,
        symbol: "AAPL",
        exchangeShortName: "NASDAQ",
        quantity: 10,
      },
      existingBucketTickers: [
        {
          tickerId: 1,
          symbol: "AAPL",
          exchangeShortName: "NASDAQ",
          quantity: 10,
        },
      ],
    });

    // Click the delete button
    const deleteButton = screen.getByTestId("delete-button--AAPL");
    fireEvent.click(deleteButton);

    // Assert that onDelete was called with the correct values
    expect(onDelete).toHaveBeenCalledWith({
      tickerId: 1,
      symbol: "AAPL",
      exchangeShortName: "NASDAQ",
      quantity: 10,
    });
  });

  it("should call onCancel when delete button if not modifying an existing item", () => {
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

  it("opens ticker search dialog when input is clicked", () => {
    const onUpdate = vi.fn();

    render(
      <TickerQuantityFieldsItem
        onUpdate={onUpdate}
        existingBucketTickers={[]}
      />,
    );

    // Ensure the dialog with the "presentation" role is not rendered initially
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();

    // Open the ticker search modal by clicking the symbol field
    fireEvent.click(screen.getByLabelText(/symbol/i));

    // Ensure at least one element with the "presentation" role is rendered
    const presentations = screen.getAllByRole("presentation");
    expect(presentations.length).toBeGreaterThan(0);
  });
});
