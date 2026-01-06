
import { useGameStore } from './store/gameStore';
import { GameCanvas } from './components/GameCanvas/GameCanvas';
import { Shop } from './components/Shop/Shop';
import './index.css';

function App() {
  const runState = useGameStore(state => state.runState);
  const { actions, currentScore, round } = useGameStore(state => ({
    actions: state.actions,
    currentScore: state.currentScore,
    round: state.round
  }));

  if (runState === 'GAME_OVER') {
    return (
      <div className="game-canvas" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1>GAME OVER</h1>
        <p>You reached Round {round}</p>
        <p>Final Score: {currentScore}</p>
        <button className="btn btn-play" onClick={() => actions.initRun()}>New Run</button>
      </div>
    );
  }

  if (runState === 'SHOP') {
    return <Shop />;
  }

  return (
    <div className="App">
      <GameCanvas />
    </div>
  );
}

export default App;
