import { useState, useEffect, useRef } from 'react';

interface AudioAnalyzerResult {
  volume: number;
  frequencyData: Uint8Array;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

export const useAudioAnalyzer = (): AudioAnalyzerResult => {
  const [volume, setVolume] = useState<number>(0);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(0));
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setVolume(0);
    setFrequencyData(new Uint8Array(0));
  };
  
  const startListening = async (): Promise<void> => {
    // Clean up any existing audio context
    stopListening();
    
    try {
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Get microphone access
      microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });
      
      // Create analyzer
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Connect microphone to analyzer
      const source = audioContextRef.current.createMediaStreamSource(microphoneStreamRef.current);
      source.connect(analyserRef.current);
      
      // Create frequency data array
      const bufferLength = analyserRef.current.frequencyBinCount;
      const newFrequencyData = new Uint8Array(bufferLength);
      setFrequencyData(newFrequencyData);
      
      // Start analyzing
      const analyzeAudio = () => {
        if (!analyserRef.current) return;
        
        // Get frequency data
        const frequencyDataCopy = new Uint8Array(newFrequencyData.length);
        analyserRef.current.getByteFrequencyData(frequencyDataCopy);
        setFrequencyData(frequencyDataCopy);
        
        // Calculate volume
        let sum = 0;
        for (let i = 0; i < frequencyDataCopy.length; i++) {
          sum += frequencyDataCopy[i];
        }
        const averageVolume = sum / frequencyDataCopy.length;
        const normalizedVolume = Math.min(1, Math.max(0, averageVolume / 128));
        setVolume(normalizedVolume);
        
        // Continue analyzing
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };
      
      analyzeAudio();
    } catch (error) {
      stopListening();
      throw error;
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);
  
  return {
    volume,
    frequencyData,
    startListening,
    stopListening
  };
}; 