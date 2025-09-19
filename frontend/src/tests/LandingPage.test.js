import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

describe('LandingPage', () => {
  test('renders welcome message and login/signup buttons', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    );

    expect(screen.getByText(/Welcome to Grip Invest/i)).toBeInTheDocument();
    expect(screen.getByText(/Your trusted platform for simulated investments./i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });
});
