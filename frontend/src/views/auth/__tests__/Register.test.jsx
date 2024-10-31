import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach } from "vitest";
import { BrowserRouter as Router } from "react-router-dom";
import Register from "../Register";
import * as auth from "../../../utils/auth";
import { CartContext } from "../../plugin/Context";
import { SearchContext } from "../../../utils/SearchContext";
import "@testing-library/jest-dom";

vi.spyOn(auth, "register"); // Mock the register function

describe("Register Component", () => {
  beforeEach(() => {
    // Reset the mock before each test
    auth.register.mockReset();
  });

  // Mock CartContext value
  const cartContextValue = [0, vi.fn()]; // Cart count as 0 and a mock function to update

  // Mock SearchContext value
  const searchContextValue = {
    searchQuery: "",
    setSearchQuery: vi.fn(), // Mock the search function
  };

  const renderWithContext = (component) => {
    return render(
      <Router>
        <CartContext.Provider value={cartContextValue}>
          <SearchContext.Provider value={searchContextValue}>
            {component}
          </SearchContext.Provider>
        </CartContext.Provider>
      </Router>
    );
  };

  it("renders the Register form with necessary inputs and button", () => {
    renderWithContext(<Register />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();

    // Use getAllByLabelText to account for multiple password fields
    const passwordFields = screen.getAllByLabelText(/Password/i);
    expect(passwordFields[0]).toBeInTheDocument(); // First password field (Password)
    expect(passwordFields[1]).toBeInTheDocument(); // Second password field (Confirm Password)

    expect(
      screen.getByRole("button", { name: /Sign Up/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors if form is submitted with invalid data", async () => {
    renderWithContext(<Register />);
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    // Check for validation messages
    expect(
      await screen.findByText(/Full Name is required/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Password is required/i)
    ).toBeInTheDocument();
  });

  it("shows error message if passwords do not match", async () => {
    renderWithContext(<Register />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "johndoe@gmail.com" },
    });

    // Use getAllByLabelText for Password fields
    const passwordFields = screen.getAllByLabelText(/Password/i);
    fireEvent.change(passwordFields[0], { target: { value: "password123" } }); // First password input
    fireEvent.change(passwordFields[1], { target: { value: "wrongpassword" } }); // Confirm password input

    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
  });

  it("submits the form successfully and navigates to login page", async () => {
    auth.register.mockResolvedValueOnce({}); // Mock successful register

    renderWithContext(<Register />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "johndoe@gmail.com" },
    });

    const passwordFields = screen.getAllByLabelText(/Password/i);
    fireEvent.change(passwordFields[0], { target: { value: "password123" } }); // First password input
    fireEvent.change(passwordFields[1], { target: { value: "password123" } }); // Confirm password input

    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(auth.register).toHaveBeenCalledWith(
        "John Doe",
        "johndoe@gmail.com",
        "password123",
        "password123"
      );
    });
  });

});
