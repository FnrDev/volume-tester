import React from 'react';

interface VolumeMeterProps {
  volume: number;
}

export const VolumeMeter: React.FC<VolumeMeterProps> = ({ volume }) => {
  // Calculate the width percentage based on the volume (0-1)
  const widthPercentage = `${Math.round(volume * 100)}%`;
  
  // Determine the color based on volume level
  const getColor = () => {
    if (volume < 0.3) return '#03dac6'; // Low volume - teal
    if (volume < 0.7) return '#bb86fc'; // Medium volume - purple
    return '#cf6679'; // High volume - red
  };
  
  return (
    <div className="volume-meter">
      <div 
        className="volume-level" 
        style={{ 
          width: widthPercentage,
          background: getColor()
        }}
      />
    </div>
  );
}; 