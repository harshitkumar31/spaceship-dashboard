import React,{ useState } from 'react';
import { createRoot } from 'react-dom/client';
import SpaceshipDashboard from './SpaceshipDashboard';


const App = () => {
  const [metrics, setMetrics] = useState({
    speed: 800,
    altitude: 32000,
    fuel: 100,
    temperature: -40,
    thrust: 85,
    shield: 100,
    oxygen: 100,
    pressure: 1,
    radiation: 0
  });

  // Custom warning check function
  const checkWarnings = (metrics) => {
    return metrics.oxygen < 20 || 
           metrics.shield < 30 || 
           metrics.fuel < 20 || 
           metrics.radiation > 80;
  };

  // Custom warning thresholds
  const customThresholds = {
    oxygen: 15,    // More lenient oxygen threshold
    shield: 25,    // More lenient shield threshold
    fuel: 10,      // More lenient fuel threshold
    radiation: 90  // More lenient radiation threshold
  };

  return (
    <SpaceshipDashboard
      metrics={metrics}
      onMetricsUpdate={setMetrics}
      checkWarnings={checkWarnings}
      warningThresholds={customThresholds}
      updateInterval={2000} // Update every 2 seconds
      className="my-custom-class"
    />
  );
};

export default App;

const root = createRoot(document.getElementById('root'));
root.render(<App />);