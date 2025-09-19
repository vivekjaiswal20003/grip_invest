import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SignupPage from '../pages/SignupPage';
import { AuthProvider } from '../context/AuthContext';
import * as authApi from '../api/auth';

// Mock the API calls
jest.mock('../api/auth', () => ({
  signup: jest.fn(),
  checkPasswordStrength: jest.fn(),
}));

// Mock useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders signup form', () => {
    render(
      <Router>
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      </Router>
    );
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles successful signup', async () => {
    authApi.signup.mockResolvedValueOnce({ data: { token: 'mock-token' } });
    authApi.checkPasswordStrength.mockResolvedValue({ data: { strength: 'Strong' } });

    render(
      <Router>
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securepassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: '',
        email: 'jane@example.com',
        password: 'securepassword',
        riskAppetite: 'moderate',
      });
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles failed signup', async () => {
    authApi.signup.mockRejectedValueOnce({ response: { data: { message: 'Email already in use' } } });
    authApi.checkPasswordStrength.mockResolvedValue({ data: { strength: 'Weak' } });

    render(
      <Router>
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securepassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockedUsedNavigate).not.toHaveBeenCalled();
    });
  });

  it('displays password strength feedback', async () => {
    authApi.checkPasswordStrength.mockResolvedValueOnce({ data: { strength: 'Very Strong' } });

    render(
      <Router>
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'MyStrongP@ssw0rd' } });

    await waitFor(() => {
      expect(authApi.checkPasswordStrength).toHaveBeenCalledWith('MyStrongP@ssw0rd');
      expect(screen.getByText(/very strong/i)).toBeInTheDocument();
    }, { timeout: 1000 }); // Increase timeout for debounce
  });
});
