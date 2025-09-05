import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  const defaultProps = {
    title: "No data found",
    buttonText: "Create New",
    onButtonClick: jest.fn(),
  };

  it("renders with required props", () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText("No data found")).toBeInTheDocument();
    expect(screen.getByText("Create New")).toBeInTheDocument();
  });

  it("renders with optional description", () => {
    render(
      <EmptyState
        {...defaultProps}
        description="This is a helpful description"
      />
    );

    expect(
      screen.getByText("This is a helpful description")
    ).toBeInTheDocument();
  });

  it("renders with optional icon", () => {
    render(<EmptyState {...defaultProps} icon="📊" />);

    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("calls onButtonClick when button is clicked", () => {
    const mockOnClick = jest.fn();
    render(<EmptyState {...defaultProps} onButtonClick={mockOnClick} />);

    const button = screen.getByText("Create New");
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("renders with all props", () => {
    render(
      <EmptyState
        title="Custom Title"
        description="Custom description text"
        buttonText="Custom Button"
        onButtonClick={jest.fn()}
        icon="🎯"
      />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom description text")).toBeInTheDocument();
    expect(screen.getByText("Custom Button")).toBeInTheDocument();
    expect(screen.getByText("🎯")).toBeInTheDocument();
  });

  it("has correct CSS classes", () => {
    render(<EmptyState {...defaultProps} />);

    // The main container is the outermost div with the classes
    const container = screen.getByText("No data found").closest("div");
    // Navigate up to the main container div
    const mainContainer = container?.parentElement;
    expect(mainContainer).toHaveClass(
      "col-span-full",
      "text-center",
      "py-6",
      "sm:py-8",
      "lg:py-12",
      "px-4"
    );

    const button = screen.getByText("Create New");
    expect(button).toHaveClass(
      "bg-doser-primary",
      "hover:bg-doser-primary-hover"
    );
  });
});
