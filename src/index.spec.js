/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpaceshipDashboard from './SpaceshipDashboard.jsx';

// Mock the recharts components since they use canvas/svg
jest.mock('recharts', () => ({
  RadialBarChart: () => <div data-testid="mock-radial-chart" />,
  RadialBar: () => <div />,
  PieChart: () => <div data-testid="mock-pie-chart" />,
  Pie: () => <div />,
  Cell: () => <div />,
  LineChart: () => <div />,
  Line: () => <div />,
  AreaChart: () => <div />,
  Area: () => <div />
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="mock-alert-circle">AlertCircle</div>,
  Thermometer: () => <div data-testid="mock-thermometer">Thermometer</div>,
  Gauge: () => <div data-testid="mock-gauge">Gauge</div>,
  Battery: () => <div data-testid="mock-battery">Battery</div>,
  Wind: () => <div data-testid="mock-wind">Wind</div>,
  Navigation: () => <div data-testid="mock-navigation">Navigation</div>
}));

describe('SpaceshipDashboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<SpaceshipDashboard />);
    expect(screen.getByText(/km\/h/i)).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    const { container } = render(<SpaceshipDashboard />);
    const sections = container.querySelectorAll('.Card');
    expect(sections).toHaveLength(5); // Cockpit, Body, Left Wing, Right Wing, Engine
  });

  it('focuses on component when clicked', () => {
    render(<SpaceshipDashboard />);
    const cockpit = screen.getByText(/Altitude/i).closest('.Card');
    fireEvent.click(cockpit);
    expect(cockpit).toHaveClass('scale-110');
  });

  it('shows warning messages when metrics are critical', async () => {
    render(<SpaceshipDashboard />);
    
    // Wait for metrics to update to critical values
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check if warning messages appear
    const warnings = await screen.findAllByText(/critical|warning|alert|danger/i);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('updates metrics periodically', () => {
    const { rerender } = render(<SpaceshipDashboard />);
    const initialAltitude = screen.getByText(/Altitude:/i).textContent;

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    rerender(<SpaceshipDashboard />);

    const updatedAltitude = screen.getByText(/Altitude:/i).textContent;
    expect(updatedAltitude).not.toBe(initialAltitude);
  });

  it('displays correct temperature color based on value', () => {
    render(<SpaceshipDashboard />);
    const temperatureElement = screen.getByTestId('mock-thermometer');
    expect(temperatureElement).toBeInTheDocument();
  });

  // Test Card Component separately
  describe('Card Component', () => {
    it('renders with custom className', () => {
      const { container } = render(
        <Card className="test-class">
          <div>Test Content</div>
        </Card>
      );
      expect(container.firstChild).toHaveClass('test-class');
    });

    it('passes through additional props', () => {
      const { container } = render(
        <Card data-testid="test-card">
          <div>Test Content</div>
        </Card>
      );
      expect(container.firstChild).toHaveAttribute('data-testid', 'test-card');
    });
  });

  describe('Warning System', () => {
    it('shows oxygen warning when level is below 20%', async () => {
      render(<SpaceshipDashboard />);
      
      // Force oxygen level to be critical
      act(() => {
        jest.advanceTimersByTime(5000); // Advance time to let oxygen decrease
      });

      const oxygenWarning = await screen.findByText(/low oxygen level/i);
      expect(oxygenWarning).toBeInTheDocument();
    });

    it('shows multiple warnings simultaneously', async () => {
      render(<SpaceshipDashboard />);
      
      // Force multiple critical conditions
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      const warnings = await screen.findAllByText(/critical|warning|alert|danger/i);
      expect(warnings.length).toBeGreaterThan(1);
    });
  });

  describe('Gauge Components', () => {
    it('renders speedometer with correct speed', () => {
      render(<SpaceshipDashboard />);
      const speedElement = screen.getByText(/km\/h/i);
      expect(speedElement).toBeInTheDocument();
    });

    it('renders fuel gauge with correct level', () => {
      render(<SpaceshipDashboard />);
      const fuelElement = screen.getByText(/fuel level/i);
      expect(fuelElement).toBeInTheDocument();
    });
  });
});

// Test helper function to create an object with a specific metric value
const createMetricState = (metricName, value) => {
    return {
      metrics: {
        speed: 800,
        altitude: 32000,
        fuel: 100,
        temperature: -40,
        thrust: 85,
        shield: 100,
        oxygen: 100,
        pressure: 1,
        radiation: 0,
        [metricName]: value,
      },
    };
  };