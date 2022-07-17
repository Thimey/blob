import React, { useContext } from 'react';

import { GameContext } from 'game/GameProvider';

export const MassDisplay = () => {
  const gameServices = useContext(GameContext);
  const mass = gameServices.gameService?.state.context.mass;

  return <div>{`Mass: ${mass}`}</div>;
};
