import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from "../../plugin/Context";
import { SearchContext } from "../../../utils/SearchContext";
import CourseCreate from '../CourseCreate';
import useAxios from '../../../utils/useAxios';
import { useAuthStore } from '../../../store/auth';
import Swal from 'sweetalert2';
import { vi } from 'vitest';
import '@testing-library/jest-dom'; // Import jest-dom for extended matchers

// Mock useAxios for API calls
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
};


// Mock CKEditor to avoid issues with initialization in tests
vi.mock('@ckeditor/ckeditor5-react', () => ({
  CKEditor: () => <div>CKEditor Mock</div>,
}));

// Mock useAuthStore to return a user with teacher_id
vi.mock('../../store/auth', () => ({
  useAuthStore: vi.fn(),
}));

// Mock Swal
vi.mock('sweetalert2', () => ({
  fire: vi.fn(),
}));

// Custom render function with context providers and router
const renderWithContext = (ui, { cartContextValue = [0, () => {}], searchContextValue = { searchQuery: '', setSearchQuery: vi.fn() }, authStoreValue = { user: { teacher_id: '123' } }, ...options } = {}) => {
  vi.mock('../../store/auth', () => ({
    useAuthStore: vi.fn(() => authStoreValue),
  }));

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

describe('CourseCreate Component', () => {
  test('renders without crashing', () => {
    renderWithContext(<CourseCreate />);
    expect(screen.getByText(/Add New Course/i)).toBeInTheDocument();
  });

  test('updates form fields correctly', () => {
    renderWithContext(<CourseCreate />);
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'New Course Title' },
    });
    expect(screen.getByLabelText(/Title/i).value).toBe('New Course Title');

    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: '50.00' },
    });
    expect(screen.getByLabelText(/Price/i).value).toBe('50.00');
  });

});
