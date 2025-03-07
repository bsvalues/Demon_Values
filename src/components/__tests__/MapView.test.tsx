import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MapView from '../MapView';
import { AppProvider } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

// Mock Mapbox GL
jest.mock('mapbox-gl', () => ({
  Map: jest.fn(),
  NavigationControl: jest.fn(),
}));

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => Promise.resolve({ data: [] }))
        }))
      }))
    }))
  },
  checkSupabaseConnection: jest.fn(() => Promise.resolve())
}));

describe('MapView Component', () => {
  const mockFilters = {
    minValue: 0,
    maxValue: 1000000,
    cluster: 'all',
    weights: {
      location: 1,
      size: 1,
      age: 1,
    }
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <AppProvider>
        <MapView filters={mockFilters} />
      </AppProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles database connection errors gracefully', async () => {
    const mockError = new Error('Database connection failed');
    (supabase.from as jest.Mock).mockImplementationOnce(() => {
      throw mockError;
    });

    render(
      <AppProvider>
        <MapView filters={mockFilters} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Database connection failed/i)).toBeInTheDocument();
    });
  });

  it('updates map view when filters change', async () => {
    const { rerender } = render(
      <AppProvider>
        <MapView filters={mockFilters} />
      </AppProvider>
    );

    const newFilters = {
      ...mockFilters,
      minValue: 100000
    };

    rerender(
      <AppProvider>
        <MapView filters={newFilters} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });
  });

  it('handles property selection', async () => {
    const mockProperty = {
      id: '1',
      address: '123 Test St',
      value: 500000,
      latitude: 37.7749,
      longitude: -122.4194,
      cluster: 'test'
    };

    render(
      <AppProvider>
        <MapView filters={mockFilters} />
      </AppProvider>
    );

    // Simulate property selection
    fireEvent.click(screen.getByTestId('map-point'));

    await waitFor(() => {
      expect(screen.getByText(mockProperty.address)).toBeInTheDocument();
    });
  });
});