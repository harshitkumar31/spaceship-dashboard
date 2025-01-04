import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Battery, Thermometer, Wind } from 'lucide-react';
// Custom toast implementation

const SpaceshipDashboard = ({
  speed = 0,
  fuel = 100,
  altitude = 1000,
  temperature = 23,
  shield = 100,
  oxygen = 100,
  warningThresholds = {
    speed: 800,
    fuel: 20,
    temperature: 50,
    shield: 30,
    oxygen: 25
  },
  checkWarning = (metric, value, threshold) => value > threshold || value < threshold,
}) => {
  const [focusedComponent, setFocusedComponent] = useState(null);
  const [warnings, setWarnings] = useState({});
  const [toasts, setToasts] = useState([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const newWarnings = {
      speed: checkWarning('speed', speed, warningThresholds.speed),
      fuel: checkWarning('fuel', fuel, warningThresholds.fuel),
      temperature: checkWarning('temperature', temperature, warningThresholds.temperature),
      shield: checkWarning('shield', shield, warningThresholds.shield),
      oxygen: checkWarning('oxygen', oxygen, warningThresholds.oxygen),
    };

    // Check for new warnings and create toasts
    Object.entries(newWarnings).forEach(([metric, isWarning]) => {
      if (isWarning && !warnings[metric]) {
        addToast(`Warning: ${metric.charAt(0).toUpperCase() + metric.slice(1)} threshold exceeded`);
      }
    });

    setWarnings(newWarnings);
  }, [speed, fuel, temperature, shield, oxygen, checkWarning]);

  const addToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const MetricGauge = ({ value, max, label, warning, icon: Icon }) => (
    <div className={`relative p-4 bg-black/30 rounded-lg border border-cyan-500/30
      ${warning ? 'animate-shake' : ''} transition-all duration-300`}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-cyan-400 text-sm">{label}</div>
        <Icon className="w-4 h-4 text-cyan-400" />
      </div>
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`absolute h-full rounded-full transition-all duration-300
            ${warning ? 'bg-red-500' : 'bg-cyan-400'}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <div className="mt-2 text-right text-cyan-300 font-mono">
        {value.toFixed(0)}<span className="text-xs ml-1">/{max}</span>
      </div>
    </div>
  );

  const DataDisplay = ({ label, value, warning }) => (
    <div className={`text-cyan-400 font-mono ${warning ? 'animate-pulse' : ''}`}>
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-2xl">{value}</div>
    </div>
  );

  return (
    <div className="relative w-full h-full min-h-screen bg-gray-900 p-8">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a192f_1px,transparent_1px),linear-gradient(to_bottom,#0a192f_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative z-10 grid grid-cols-12 gap-4">
        {/* Header */}
        <div className="col-span-12 flex justify-between items-center text-cyan-400 border-b border-cyan-500/30 pb-4 mb-4">
          <div className="text-2xl font-mono">ID-XFRT89</div>
          <div className="flex gap-4">
            {Object.entries(warnings).map(([key, value]) => (
              <div key={key} className={`px-2 py-1 rounded ${value ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20'}`}>
                {key.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Main Metrics */}
        <div className="col-span-3 space-y-4">
          <MetricGauge 
            value={speed} 
            max={1000} 
            label="VELOCITY" 
            warning={warnings.speed}
            icon={Wind}
          />
          <MetricGauge 
            value={fuel} 
            max={100} 
            label="FUEL" 
            warning={warnings.fuel}
            icon={Battery}
          />
        </div>

        {/* Central Display */}
        <div className="col-span-6 bg-black/30 rounded-lg border border-cyan-500/30 p-6">
          <div className="grid grid-cols-2 gap-6">
            <DataDisplay 
              label="SHIELD INTEGRITY" 
              value={`${shield}%`} 
              warning={warnings.shield}
            />
            <DataDisplay 
              label="OXYGEN LEVELS" 
              value={`${oxygen}%`} 
              warning={warnings.oxygen}
            />
            <DataDisplay 
              label="TEMPERATURE" 
              value={`${temperature}°C`} 
              warning={warnings.temperature}
            />
            <DataDisplay 
              label="ALTITUDE" 
              value={`${altitude}km`} 
            />
          </div>

          {/* System Graph */}
          <div className="mt-6 h-32 bg-black/50 rounded border border-cyan-500/30">
            <div className="h-full w-full flex items-end px-2">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className="w-full h-full flex items-end"
                >
                  <div 
                    className="w-full bg-cyan-400/70 mx-px transition-all duration-300"
                    style={{ 
                      height: `${Math.random() * 100}%`,
                      opacity: i === focusedComponent ? 1 : 0.5 
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Panels */}
        <div className="col-span-3 space-y-4">
          <div className="bg-black/30 rounded-lg border border-cyan-500/30 p-4">
            <h3 className="text-cyan-400 mb-2">SYSTEM STATUS</h3>
            <div className="space-y-2">
              {['Core', 'Navigation', 'Life Support'].map(system => (
                <div key={system} className="flex justify-between items-center text-sm">
                  <span className="text-cyan-300">{system}</span>
                  <span className="text-green-400">ONLINE</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="flex items-center gap-2 px-4 py-3 bg-black/80 border-l-4 border-red-500 
              text-white rounded shadow-lg backdrop-blur-sm animate-slide-up max-w-md"
          >
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="flex flex-col">
              <div className="text-sm font-mono text-red-500">ALERT</div>
              <div className="text-sm">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom animation keyframes */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SpaceshipDashboard;