import React from 'react';
import './App.css';

import { Header } from './components/Header';
import { SpotifyPlayer } from './components/SpotifyPlayer';

function App() {
  return (
    <div className="App">
      <Header />
      <SpotifyPlayer />
    </div>
  );
}

export default App;
