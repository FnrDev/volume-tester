import React, { useMemo } from 'react';

interface VolumeVisualizerProps {
  frequencyData: Uint8Array;
}

export const VolumeVisualizer: React.FC<VolumeVisualizerProps> = ({ frequencyData }) => {
  // We'll use a subset of the frequency data to create our visualization
  // This will create a more visually appealing effect
  const bars = useMemo(() => {
    // If we don't have frequency data yet, return an empty array
    if (!frequencyData.length) {
      return Array(30).fill(0);
    }
    
    // We'll use 30 bars for our visualization
    const numberOfBars = 30;
    const result = [];
    
    // Calculate how many frequency bins to skip to get evenly distributed bars
    const step = Math.floor(frequencyData.length / numberOfBars) || 1;
    
    // Create the bars with heights based on frequency data
    for (let i = 0; i < numberOfBars; i++) {
      const index = i * step;
      if (index < frequencyData.length) {
        // Normalize the value to a percentage (0-100)
        const value = frequencyData[index] / 255 * 100;
        result.push(value);
      } else {
        result.push(0);
      }
    }
    
    return result;
  }, [frequencyData]);
  
  return (
    <div className="visualizer">
      <div className="bars-container">
        {bars.map((height, index) => (
          <div
            key={index}
            className="bar"
            style={{
              height: `${height}%`,
              // Add a slight delay to each bar for a wave effect
              transitionDelay: `${index * 10}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
}; 