import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Estate Sale Inventory')).toBeInTheDocument();
  });

  it('shows login button', () => {
    render(<App />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
