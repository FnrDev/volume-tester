import React, { useState, useEffect, useRef } from 'react';
import { VolumeVisualizer } from './components/VolumeVisualizer';
import { VolumeMeter } from './components/VolumeMeter';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    volume, 
    frequencyData, 
    startListening, 
    stopListening 
  } = useAudioAnalyzer();

  const handleStartListening = async () => {
    try {
      await startListening();
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
      console.error(err);
    }
  };

  const handleStopListening = () => {
    stopListening();
    setIsListening(false);
  };

  return (
    <div className="container">
      <h1>Voice Volume Tester</h1>
      
      <div className="volume-display">
        <VolumeMeter volume={volume} />
        <div className="volume-value">{Math.round(volume * 100)}%</div>
      </div>
      
      <VolumeVisualizer frequencyData={frequencyData} />
      
      <div className="controls">
        {!isListening ? (
          <button onClick={handleStartListening}>Start Listening</button>
        ) : (
          <button onClick={handleStopListening}>Stop Listening</button>
        )}
      </div>
      
      {error && <div className="status error">{error}</div>}
      {isListening && !error && (
        <div className="status">Listening to your voice...</div>
      )}
    </div>
  );
};

export default App; 