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

  it("should call onDelete when delete button is clicked if tickers exist", () => {
    const onDelete = vi.fn();
    renderComponent({
      onDelete,
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
      expect(onDelete).toHaveBeenCalled();
    }
  });

  it("should not render delete button when there are no tickers", () => {
    renderComponent({ existingBucketTickers: [] });

    const deleteButton = screen.queryByTestId("delete-button");
    expect(deleteButton).not.toBeInTheDocument();
  });
});
