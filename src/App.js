import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { setupAudio } from "./setupAudio";

function PitchReadout({ running, latestPitch }) {

  return (
    <div className='Pitch-readout'>
      {
        latestPitch
          ? `${latestPitch.toFixed(1)} Hz`
          : running
            ? "Listening..."
            : "Paused"
      }
    </div>
  )
}

function AudioRecorderControl() {
  const [audio, setAudio] = useState(undefined);
  const [running, setRunning] = useState(false);
  const [pitch, setPitch] = useState(undefined);

  if (!audio) {
    const activate = async () => {
      setAudio(await setupAudio(setPitch));
      setRunning(true);
    }

    return (<button onClick={activate}>
      Listen
    </button>)
  }

  const { context } = audio;

  const handleClick = async () => {
    if (running) {
      await context.suspend();
    } else {
      await context.resume();
    }
    setRunning(context.state === "running");
  }

  return <div>
    <button
      onClick={handleClick}
      disabled={context.state !== "running" && context.state !== "suspended"}
    >
      {running ? "Pause" : "Resume"}
    </button>
    <PitchReadout running={running} latestPitch={pitch} />
  </div>
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Web Assembly Audio Tutorial
      </header>
      <div className='App-content'>
        <AudioRecorderControl />
      </div>
    </div>
  );
}

export default App;
