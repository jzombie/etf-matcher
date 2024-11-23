import React from "react";

import { fireEvent, screen } from "@testing-library/react";

import { TickerBucket } from "@src/store";
import { v4 as uuidv4 } from "uuid";

import TickerBucketForm from "@components/TickerBucketManager/TickerBucketManager.BucketForm";

import { render } from "../../../test/customRender";

describe("TickerBucketForm", () => {
  const mockExistingBucket: TickerBucket = {
    uuid: uuidv4(),
    name: "Test Bucket",
    description: "Test Description",
    tickers: [],
    type: "portfolio",
    isUserConfigurable: true,
  };

  it("should show the description field if existingBucket has a description", () => {
    render(
      <TickerBucketForm
        bucketType="portfolio"
        existingBucket={mockExistingBucket}
      />,
    );

    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it("should hide the description field if existingBucket does not have a description", () => {
    const mockBucketWithoutDescription = {
      ...mockExistingBucket,
      description: "",
    };
    render(
      <TickerBucketForm
        bucketType="portfolio"
        existingBucket={mockBucketWithoutDescription}
      />,
    );

    expect(screen.queryByLabelText(/Description/i)).not.toBeInTheDocument();
  });

  it("should toggle the visibility of the description field when the button is clicked", () => {
    render(
      <TickerBucketForm
        bucketType="portfolio"
        existingBucket={mockExistingBucket}
      />,
    );

    const toggleButton = screen.getByText(/Hide Description Field/i);
    fireEvent.click(toggleButton);

    expect(screen.queryByLabelText(/Description/i)).not.toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should render TickerQuantityFields if bucketType is "portfolio" and disableTickerQuantityFields is false', () => {
    render(
      <TickerBucketForm
        bucketType="portfolio"
        disableTickerQuantityFields={false}
      />,
    );

    expect(screen.getByText(/Add Additional Symbol/i)).toBeInTheDocument();
  });

  it("should not render TickerQuantityFields if disableTickerQuantityFields is true", () => {
    render(
      <TickerBucketForm
        bucketType="portfolio"
        disableTickerQuantityFields={true}
      />,
    );

    const element = screen.queryByText(/Add Additional Symbol/i);

    // Then, check the element's presence
    expect(element).not.toBeInTheDocument();
  });

  it('should not render TickerQuantityFields if bucketType is "watchlist" and disableTickerQuantityFields is true', () => {
    render(
      <TickerBucketForm
        bucketType="watchlist"
        disableTickerQuantityFields={true}
      />,
    );

    const element = screen.queryByText(/Add Additional Symbol/i);

    // Then, check the element's presence
    expect(element).not.toBeInTheDocument();
  });
});
