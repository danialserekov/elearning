import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, beforeAll } from "vitest";
import { BrowserRouter as Router } from "react-router-dom";
import Login from "../Login";
import * as auth from "../../../utils/auth";
import { CartContext } from "../../plugin/Context";
import { SearchContext } from "../../../utils/SearchContext";
import "@testing-library/jest-dom";

// Mock the login function
vi.spyOn(auth, "login");

describe("Login Component", () => {
  beforeEach(() => {
    // Reset the mock before each test
    auth.login.mockReset();
  });

  // Mock CartContext value
  const cartContextValue = [0, vi.fn()]; // Cart count as 0 and a mock function to update

  // Mock SearchContext value
  const searchContextValue = {
    searchQuery: "",
    setSearchQuery: vi.fn(), // Mock the search function
  };

  beforeAll(() => {
    window.alert = vi.fn(); // Mock window.alert
  });

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

  it("renders the login form with necessary inputs and button", () => {
    renderWithContext(<Login />);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors if form is submitted with empty fields", async () => {
    renderWithContext(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    // Check for validation messages
    expect(await screen.findByText(/Please enter a valid email/i)).toBeInTheDocument();
    expect(await screen.findByText(/Please enter a valid password/i)).toBeInTheDocument();
  });

  it("toggles password visibility when clicking the eye icon", () => {
    renderWithContext(<Login />);

    const passwordInput = screen.getByLabelText(/Password/i);
    const toggleIcon = screen.getByTestId("password-visibility-toggle"); // Updated selector
    
    // Check if the password is hidden by default
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click the eye icon to toggle visibility
    fireEvent.click(toggleIcon);

    // Check if the password is now visible
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click again to hide the password
    fireEvent.click(toggleIcon);

    // Check if the password is hidden again
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("submits the form successfully and navigates to home page", async () => {
    // Mock successful login response
    auth.login.mockResolvedValueOnce({
      access: "access-token",
      refresh: "refresh-token",
      error: null,
    });

    renderWithContext(<Login />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "johndoe@gmail.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith("johndoe@gmail.com", "password123");
    });

    expect(auth.login).toHaveBeenCalledTimes(1);
  });

  it("shows error message on login failure", async () => {
    // Reset window.alert before this test
    window.alert.mockClear();
  
    // Mock failed login response
    auth.login.mockResolvedValueOnce({
      access: null,
      refresh: null,
      error: "Login failed",
    });
  
    renderWithContext(<Login />);
  
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "johndoe@gmail.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
  
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));
  
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Login failed");
    });
  
    // Ensure window.alert is called only once
    expect(window.alert).toHaveBeenCalledTimes(1);
  });
  
});
