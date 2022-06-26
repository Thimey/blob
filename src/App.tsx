import React from 'react';
import { Game } from 'src/game/Game';
import { GameProvider } from 'game/GameProvider';
import './App.css';

function App() {
  return (
    <div className="App">
      <GameProvider>
        <Game />
      </GameProvider>
    </div>
  );
}

export default App;
