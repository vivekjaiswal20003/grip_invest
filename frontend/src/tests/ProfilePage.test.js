import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';
import { AuthProvider } from '../context/AuthContext';
import * as userApi from '../api/user';
import * as productsApi from '../api/products';

// Mock the API calls
jest.mock('../api/user', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('../api/products', () => ({
  getProductRecommendations: jest.fn(),
}));

describe('ProfilePage', () => {
  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    riskAppetite: 'moderate',
    balance: '50000.00'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userApi.getProfile.mockResolvedValue({ data: mockUser });
    userApi.updateProfile.mockResolvedValue({ data: { ...mockUser, riskAppetite: 'high' } });
    productsApi.getProductRecommendations.mockResolvedValue({ data: { recommendations: [] } });
  });

  it('renders profile page and displays user data', async () => {
    render(
      <Router>
        <AuthProvider>
          <ProfilePage />
        </AuthProvider>
      </Router>
    );

    // Wait for profile to load and check for user data
    expect(await screen.findByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('moderate')).toBeInTheDocument();
  });

  it('handles profile update successfully', async () => {
    render(
      <Router>
        <AuthProvider>
          <ProfilePage />
        </AuthProvider>
      </Router>
    );

    await screen.findByText(/John/);

    fireEvent.change(screen.getByLabelText(/risk appetite/i), { target: { value: 'high' } });
    fireEvent.click(screen.getByRole('button', { name: /update risk appetite/i }));

    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({ riskAppetite: 'high' });
      expect(screen.getByText(/profile updated successfully!/i)).toBeInTheDocument();
    });
  });

  it('fetches and displays AI recommendations', async () => {
    const mockRecs = [
      { productName: 'Test Fund', reason: 'Good fit', annualYield: '8%' }
    ];
    productsApi.getProductRecommendations.mockResolvedValue({ data: { recommendations: mockRecs } });

    render(
      <Router>
        <AuthProvider>
          <ProfilePage />
        </AuthProvider>
      </Router>
    );

    await screen.findByText(/John/);

    fireEvent.click(screen.getByRole('button', { name: /get recommendations/i }));

    await waitFor(() => {
      expect(productsApi.getProductRecommendations).toHaveBeenCalled();
      expect(screen.getByText(/test fund/i)).toBeInTheDocument();
      expect(screen.getByText(/good fit/i)).toBeInTheDocument();
    });
  });

});
