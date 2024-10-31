import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from "../../plugin/Context";
import { SearchContext } from "../../../utils/SearchContext";
import Coupon from '../Coupon';
import '@testing-library/jest-dom'; // Import jest-dom for extended matchers

// Mock useAxios for API calls
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../../../utils/useAxios', () => ({
  default: () => mockAxios,
}));

// Mock useAuthStore to return a user with teacher_id
vi.mock('../../store/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { teacher_id: '1' },
  })),
}));

// Mock Toast
vi.mock('../plugin/Toast', () => () => ({
  fire: vi.fn(),
}));

// Custom render function with context providers and router
const renderWithContext = (ui, { cartContextValue = [0, () => {}], searchContextValue = { searchQuery: '', setSearchQuery: vi.fn() }, ...options } = {}) => {
  return render(
    <MemoryRouter>
      <CartContext.Provider value={cartContextValue}>
        <SearchContext.Provider value={searchContextValue}>
          {ui}
        </SearchContext.Provider>
      </CartContext.Provider>
    </MemoryRouter>,
    options
  );
};

describe('Coupon Component', () => {
  it('renders coupon list and add coupon button', async () => {
    // Mock data for coupons
    const couponMock = [{ code: 'DISCOUNT10', discount: '10% Discount', date: '2023-09-06', id: 1, used_by: '5' }];
    mockAxios.get.mockResolvedValueOnce({ data: couponMock });

    renderWithContext(<Coupon />);

    // Check if the Add Coupon button is present
    expect(screen.getByRole('button', { name: /Add Coupon/i })).toBeInTheDocument();

    // Wait for coupon list to be rendered
    await waitFor(() => {
      expect(screen.getByText(/DISCOUNT10/i)).toBeInTheDocument();
      expect(screen.getByText(/10% Discount/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Student/i)).toBeInTheDocument();
    });
  });

});
