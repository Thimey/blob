import React from 'react';
import { Game } from 'src/game/Game';
import './App.css';

function App() {
  return (
    <div className="App">
      <h2>BLOB GAME</h2>
      <div id="view-port"></div>
      <Game />
    </div>
  );
}

export default App;
