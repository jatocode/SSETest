import { useEffect, useState } from 'react'
import './App.css'
import type { HeartRate } from './HeartRate';

function App() {

  const [heartRates, setHeartRates] = useState<HeartRate[]>([]);
  useEffect(() => {
    const eventSource = setupEventSourceHeartbeats((heartRate: HeartRate) => {
      setHeartRates((prevHeartRates) => [heartRate, ...prevHeartRates]);
    });

    return () => eventSource.close();

  }, [])

  return (
    <>
    <h2>Heart Rate Monitor</h2>
    <ul>
      {heartRates.slice(0, 5).map((hr, index) => (
        <li key={index}>
          {hr.timestamp.toString()}: {hr.heartRate} bpm
        </li>
      ))}
    </ul>
    </>
  )
}

export default App

function setupEventSourceHeartbeats(onHeartRate: (heartRate: HeartRate) => void) {
  const eventSource = new EventSource('http://localhost:5144/json-item');

  eventSource.addEventListener('heartRate', (event) => {
    const heartRateData:HeartRate = JSON.parse(event.data);
    onHeartRate(heartRateData);
    // console.log(`New heartrate @${heartRateData.timestamp}: ${heartRateData.heartRate}`);
  });

  eventSource.onopen = () => {
    console.log('Connection opened');
  };

  eventSource.onmessage = (event) => {
    console.log('Received message:', event);
  };

  // Handle errors and reconnections
  eventSource.onerror = () => {
    if (eventSource.readyState === EventSource.CONNECTING) {
      console.log('Reconnecting...');
    }
  };
  return eventSource;
}