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
    onErrorStateChange: vi.fn(),
    omitShares: false,
  };
  return render(<TickerQuantityFieldsItem {...defaultProps} {...props} />);
};

vi.mock("@components/DeleteEntityDialogModal", () => ({
  __esModule: true,
  default: ({ open, onCancel, onDelete }: any) =>
    open ? (
      <div>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    ) : null,
}));

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

  it("should call onDelete after confirming in delete confirmation dialog", () => {
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

    // Confirm the deletion in the modal
    const confirmDeleteButton = screen.getByText("Delete");
    fireEvent.click(confirmDeleteButton);

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
        onErrorStateChange={vi.fn()}
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

  it("correctly formats and updates the quantity with commas in the Shares input field while typing", () => {
    const onUpdate = vi.fn();

    render(
      <TickerQuantityFieldsItem
        onUpdate={onUpdate}
        initialBucketTicker={{
          tickerId: 1,
          symbol: "AAPL",
          exchangeShortName: "NASDAQ",
          quantity: 1000000, // Start with a value that should be formatted
        }}
        existingBucketTickers={[
          {
            tickerId: 1,
            symbol: "AAPL",
            exchangeShortName: "NASDAQ",
            quantity: 1000000,
          },
        ]}
        onErrorStateChange={vi.fn()}
      />,
    );

    // Verify the initial quantity is correctly formatted with commas
    expect(screen.getByLabelText(/shares/i)).toHaveValue("1,000,000");

    // Simulate typing to update the value and check formatting
    const sharesInput = screen.getByLabelText(/shares/i);

    // Simulate clearing the input and typing a new value
    fireEvent.change(sharesInput, { target: { value: "2000" } });
    expect(sharesInput).toHaveValue("2,000");

    fireEvent.change(sharesInput, { target: { value: "200000" } });
    expect(sharesInput).toHaveValue("200,000");

    fireEvent.change(sharesInput, { target: { value: "2000000" } });
    expect(sharesInput).toHaveValue("2,000,000");

    // Continue typing to reach a larger formatted value
    fireEvent.change(sharesInput, { target: { value: "123456789" } });
    expect(sharesInput).toHaveValue("123,456,789");

    // Test backspacing to remove digits and check the updated format
    fireEvent.change(sharesInput, { target: { value: "12345678" } });
    expect(sharesInput).toHaveValue("12,345,678");

    fireEvent.change(sharesInput, { target: { value: "1234567" } });
    expect(sharesInput).toHaveValue("1,234,567");

    fireEvent.change(sharesInput, { target: { value: "123456" } });
    expect(sharesInput).toHaveValue("123,456");

    fireEvent.change(sharesInput, { target: { value: "12345" } });
    expect(sharesInput).toHaveValue("12,345");
  });
});
