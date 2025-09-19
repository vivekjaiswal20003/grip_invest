import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ProductsPage from '../pages/ProductsPage';
import { AuthProvider } from '../context/AuthContext';
import * as productsApi from '../api/products';
import API from '../api/axios'; // Mocking API directly

// Mock the API calls
jest.mock('../api/axios');

const mockProducts = [
  { id: '1', name: 'Low Risk Bond', investmentType: 'bond', riskLevel: 'low', annualYield: '5.00' },
  { id: '2', name: 'High Yield MF', investmentType: 'mf', riskLevel: 'high', annualYield: '12.00' },
  { id: '3', name: 'Mid Cap ETF', investmentType: 'etf', riskLevel: 'moderate', annualYield: '8.00' },
];

describe('ProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    API.get.mockImplementation(url => {
      if (url === '/products') {
        return Promise.resolve({ data: mockProducts });
      }
      if (url === '/products/recommendations') {
        return Promise.resolve({ data: { recommendations: [] } });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  it('renders products page and displays all products initially', async () => {
    render(
      <Router>
        <AuthProvider>
          <ProductsPage />
        </AuthProvider>
      </Router>
    );

    expect(await screen.findByText('Low Risk Bond')).toBeInTheDocument();
    expect(screen.getByText('High Yield MF')).toBeInTheDocument();
    expect(screen.getByText('Mid Cap ETF')).toBeInTheDocument();
  });

  it('filters products by type', async () => {
    render(
      <Router>
        <AuthProvider>
          <ProductsPage />
        </AuthProvider>
      </Router>
    );

    await screen.findByText('Low Risk Bond'); // Ensure products are loaded

    fireEvent.change(screen.getByLabelText(/filter by type/i), { target: { value: 'bond' } });

    await waitFor(() => {
      expect(screen.getByText('Low Risk Bond')).toBeInTheDocument();
      expect(screen.queryByText('High Yield MF')).not.toBeInTheDocument();
      expect(screen.queryByText('Mid Cap ETF')).not.toBeInTheDocument();
    });
  });

  it('filters products by risk', async () => {
    render(
      <Router>
        <AuthProvider>
          <ProductsPage />
        </AuthProvider>
      </Router>
    );

    await screen.findByText('Low Risk Bond');

    fireEvent.change(screen.getByLabelText(/filter by risk/i), { target: { value: 'high' } });

    await waitFor(() => {
      expect(screen.queryByText('Low Risk Bond')).not.toBeInTheDocument();
      expect(screen.getByText('High Yield MF')).toBeInTheDocument();
      expect(screen.queryByText('Mid Cap ETF')).not.toBeInTheDocument();
    });
  });

  it('sorts products by yield descending', async () => {
    render(
      <Router>
        <AuthProvider>
          <ProductsPage />
        </AuthProvider>
      </Router>
    );

    await screen.findByText('Low Risk Bond');

    fireEvent.change(screen.getByLabelText(/sort by yield/i), { target: { value: 'desc' } });

    await waitFor(() => {
      const productNames = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);
      // The first three headings should be the product names in the new order
      expect(productNames.slice(0, 3)).toEqual(['High Yield MF', 'Mid Cap ETF', 'Low Risk Bond']);
    });
  });
});
