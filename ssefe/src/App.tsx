import { useEffect, useState } from 'react'
import { signal } from '@preact/signals-react';
import type { HeartRate } from './HeartRate';
import './App.css'

// Ville testa att använda signals också...
const latestHeartRate = signal(0);
const backendUrl = 'http://localhost:5144/heartbeats';

function App() {

  const [heartRates, setHeartRates] = useState<HeartRate[]>([]);
  useEffect(() => {
    const eventSource = setupEventSourceHeartbeats(backendUrl, (heartRate: HeartRate) => {
      setHeartRates((prevHeartRates) => [heartRate, ...prevHeartRates]);
      latestHeartRate.value = heartRate.heartRate;
    });

    return () => eventSource.close();

  }, [])

  return (
    <>
    <h2>Heart Rate Monitor</h2>
    <div className='latest'>Senaste: {latestHeartRate.value} bpm</div>

    <h3>Log:</h3>
    <ul>
      {heartRates.slice(0, 5).map((hr, index) => (
        <li key={index}>
          {hr.timestamp.toLocaleTimeString()}: {hr.heartRate} bpm
        </li>
      ))}
    </ul>
    </>
  )
}

export default App

function setupEventSourceHeartbeats(url: string, onHeartRate: (heartRate: HeartRate) => void) {
  const eventSource = new EventSource(url);

  eventSource.addEventListener('heartRate', (event) => {
    const heartRateData = JSON.parse(event.data);
    onHeartRate({
      heartRate: heartRateData.heartRate,
      timestamp: new Date(heartRateData.timestamp)
    });
  });

  return eventSource;
}