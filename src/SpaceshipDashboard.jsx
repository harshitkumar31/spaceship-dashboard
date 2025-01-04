import React, { useRef, useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertCircle, Thermometer, Gauge, Battery, Wind, Navigation } from 'lucide-react';
import PropTypes from 'prop-types';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`rounded-lg shadow-lg bg-opacity-50 backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Utility function to generate random value within range
const getRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Custom Gauge Component
const GaugeChart = ({ value, max, color, size = 100 }) => {
  const data = [{ value: max, fill: '#334155' }, { value, fill: color }];
  return (
    <RadialBarChart 
      width={size} 
      height={size} 
      innerRadius="60%" 
      outerRadius="100%" 
      data={data} 
      startAngle={180} 
      endAngle={0}
    >
      <RadialBar
        background
        dataKey="value"
        cornerRadius={30}
      />
    </RadialBarChart>
  );
};

// Custom Temperature Meter
const TemperatureMeter = ({ value, min, max }) => {
  const normalized = ((value - min) / (max - min)) * 100;
  const color = value > (max * 0.8) ? 'text-red-500' : 'text-blue-400';
  
  return (
    <div className="relative h-24 w-4 bg-gray-700 rounded-full overflow-hidden">
      <div 
        className={`absolute bottom-0 w-full ${color} transition-all duration-500`} 
        style={{ height: `${normalized}%` }}
      />
    </div>
  );
};

// Speedometer Component
const Speedometer = ({ speed, maxSpeed }) => {
  const data = [{ value: speed }];
  const percentage = (speed / maxSpeed) * 100;
  
  return (
    <div className="relative">
      <PieChart width={120} height={120}>
        <Pie
          data={[{ value: 100 }]}
          cx={60}
          cy={60}
          innerRadius={45}
          outerRadius={50}
          fill="#334155"
          startAngle={180}
          endAngle={0}
        />
        <Pie
          data={data}
          cx={60}
          cy={60}
          innerRadius={45}
          outerRadius={50}
          fill="#3B82F6"
          startAngle={180}
          endAngle={180 - (180 * percentage / 100)}
        />
      </PieChart>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-xl font-bold text-blue-400">{speed}</div>
        <div className="text-xs text-gray-400">km/h</div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const SpaceshipDashboard = ({
  metrics,
  onMetricsUpdate,
  checkWarnings,
  warningThresholds = {
    oxygen: 20,
    shield: 30,
    fuel: 20,
    radiation: 80
  },
  updateInterval = 1000,
  className = ''
}) => {

  
  const [focusedComponent, setFocusedComponent] = useState(null);
  const [hasWarning, setHasWarning] = useState(false);
  const dashboardRef = useRef(null);


  // Check for warning conditions
  useEffect(() => {
    setHasWarning(checkWarnings(metrics));
  }, [metrics, checkWarnings]);

  // Handle clicks outside components
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dashboardRef.current && 
          !event.target.closest('.clickable-component')) {
        setFocusedComponent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Simulate real-time updates if onMetricsUpdate is provided
  useEffect(() => {
    if (!onMetricsUpdate) return;

    const interval = setInterval(() => {
      onMetricsUpdate(prevMetrics => ({
        speed: Math.floor(Math.random() * (900 - 700 + 1)) + 700,
        altitude: Math.floor(Math.random() * (35000 - 30000 + 1)) + 30000,
        fuel: Math.max(0, prevMetrics.fuel - 0.1),
        temperature: Math.floor(Math.random() * (-30 - -50 + 1)) + -50,
        thrust: Math.floor(Math.random() * (95 - 80 + 1)) + 80,
        shield: Math.max(0, prevMetrics.shield - 0.05),
        oxygen: Math.max(0, prevMetrics.oxygen - 0.02),
        pressure: 1 + Math.random() * 0.1,
        radiation: Math.floor(Math.random() * 100)
      }));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [onMetricsUpdate, updateInterval]);

  const handleComponentClick = (component) => {
    setFocusedComponent(focusedComponent === component ? null : component);
  };

  const getComponentClasses = (component) => {
    const baseClasses = "transition-all duration-300 clickable-component ";
    if (focusedComponent === null) return baseClasses;
    
    if (focusedComponent === component) {
      return baseClasses + "scale-110 z-50";
    }
    
    const zIndexMap = {
      cockpit: "z-30",
      body: "z-20",
      leftWing: "z-10",
      rightWing: "z-10",
      engine: "z-10"
    };
    
    return `${baseClasses} opacity-30 ${zIndexMap[component]}`;
  };

  const WarningIndicator = ({ value, threshold, icon: Icon }) => (
    <div className={`flex items-center gap-2 ${value < threshold ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
      <Icon size={16} />
      <span className="text-xs">{Math.round(value)}%</span>
    </div>
  );


  return (
    <>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
          .warning-shake {
            animation: shake 0.5s ease-in-out infinite;
          }
        `}
      </style>
      <div ref={dashboardRef} className="w-full max-w-4xl mx-auto p-8 bg-gray-900 relative">
        {/* Warning Messages */}
        {hasWarning && (
          <div className="absolute bottom-4 left-4 z-50">
            <div className="warning-shake text-red-500 font-bold flex flex-col gap-1">
              {metrics.oxygen < 20 && (
                <div className="flex items-center gap-2">
                  <Wind size={16} />
                  <span>Critical: Low Oxygen Level ({Math.round(metrics.oxygen)}%)</span>
                </div>
              )}
              {metrics.shield < 30 && (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>Warning: Shield Failing ({Math.round(metrics.shield)}%)</span>
                </div>
              )}
              {metrics.fuel < 20 && (
                <div className="flex items-center gap-2">
                  <Battery size={16} />
                  <span>Alert: Low Fuel ({Math.round(metrics.fuel)}%)</span>
                </div>
              )}
              {metrics.radiation > 80 && (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>Danger: High Radiation ({metrics.radiation})</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="relative h-96">
          {/* Cockpit */}
          <Card 
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 rounded-t-full bg-gray-800 border-2 border-blue-400 cursor-pointer ${getComponentClasses('cockpit')}`}
            onClick={() => handleComponentClick('cockpit')}
          >
            <div className="h-full w-full p-4 flex flex-col items-center justify-center text-white">
              <Speedometer speed={metrics.speed} maxSpeed={1000} />
              <div className="mt-2 text-xs text-gray-400">
                Altitude: {metrics.altitude.toLocaleString()} ft
              </div>
            </div>
          </Card>

          {/* Body */}
          <Card 
            className={`absolute top-32 left-1/2 -translate-x-1/2 w-80 h-48 bg-gray-700 border-2 border-blue-400 cursor-pointer ${getComponentClasses('body')}`}
            onClick={() => handleComponentClick('body')}
          >
            <div className="h-full w-full p-4 grid grid-cols-3 gap-4">
              {/* Left Section - Temperature */}
              <div className="flex flex-col items-center justify-center">
                <Thermometer className="text-blue-400 mb-2" size={20} />
                <TemperatureMeter 
                  value={metrics.temperature} 
                  min={-100} 
                  max={100} 
                />
                <span className="text-xs mt-2 text-gray-400">
                  {metrics.temperature}°C
                </span>
              </div>

              {/* Center Section - Main Display */}
              <div className="flex flex-col items-center justify-center text-white">
                <Navigation className="text-blue-400 mb-2" size={24} />
                <div className="text-center">
                  <div className="text-xs text-gray-400">Thrust</div>
                  <div className="text-lg font-bold text-blue-400">
                    {metrics.thrust}%
                  </div>
                </div>
              </div>

              {/* Right Section - Pressure */}
              <div className="flex flex-col items-center justify-center">
                <Gauge className="text-blue-400 mb-2" size={20} />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {metrics.pressure.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">ATM</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Left Wing */}
          <Card 
            className={`absolute top-40 left-8 w-40 h-32 transform -rotate-12 bg-gray-600 border-2 border-blue-400 cursor-pointer ${getComponentClasses('leftWing')}`}
            onClick={() => handleComponentClick('leftWing')}
          >
            <div className="h-full w-full p-4 flex flex-col items-center justify-center">
              <div className="text-center mb-2">
                <div className="text-xs text-gray-400">Fuel Level</div>
              </div>
              <GaugeChart 
                value={metrics.fuel} 
                max={100} 
                color="#3B82F6"
                size={80}
              />
              <div className="text-sm font-bold text-blue-400 mt-2">
                {Math.round(metrics.fuel)}%
              </div>
            </div>
          </Card>

          {/* Right Wing */}
          <Card 
            className={`absolute top-40 right-8 w-40 h-32 transform rotate-12 bg-gray-600 border-2 border-blue-400 cursor-pointer ${getComponentClasses('rightWing')}`}
            onClick={() => handleComponentClick('rightWing')}
          >
            <div className="h-full w-full p-4 flex flex-col items-center justify-center">
              <div className="text-center mb-2">
                <div className="text-xs text-gray-400">Shield Integrity</div>
              </div>
              <GaugeChart 
                value={metrics.shield} 
                max={100} 
                color="#10B981"
                size={80}
              />
              <div className="text-sm font-bold text-emerald-400 mt-2">
                {Math.round(metrics.shield)}%
              </div>
            </div>
          </Card>

          {/* Engine */}
          <Card 
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gray-900 border-2 border-blue-400 cursor-pointer ${getComponentClasses('engine')}`}
            onClick={() => handleComponentClick('engine')}
          >
            <div className="h-full w-full p-4">
              <div className="grid grid-cols-2 gap-2">
                <WarningIndicator 
                  value={metrics.oxygen} 
                  threshold={20} 
                  icon={Wind}
                />
                <WarningIndicator 
                  value={metrics.shield} 
                  threshold={30} 
                  icon={AlertCircle}
                />
                <WarningIndicator 
                  value={metrics.fuel} 
                  threshold={20} 
                  icon={Battery}
                />
                <div className={`flex items-center gap-2 ${
                  metrics.radiation > 80 ? 'text-red-500 animate-pulse' : 'text-gray-400'
                }`}>
                  <span className="text-xs">RAD</span>
                  <span className="text-xs">{metrics.radiation}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Engine Flames */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-8">
            <div className="relative w-full h-full">
              <div className="absolute inset-x-0 top-0 h-8 bg-orange-500 rounded-b-lg animate-pulse"></div>
              <div className="absolute inset-x-4 top-2 h-8 bg-yellow-500 rounded-b-lg animate-pulse"></div>
              <div className="absolute inset-x-8 top-4 h-8 bg-red-500 rounded-b-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpaceshipDashboard;