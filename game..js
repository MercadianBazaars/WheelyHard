import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [card, setCard] = useState(null);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  // Load a random card
  async function loadNewCard() {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.scryfall.com/cards/random?q=is:hires+has:art_crop"
      );
      const data = await response.json();
      setCard({
        name: data.name,
        artUrl: data.image_uris.art_crop
      });
      setGuesses(0);
      setRevealed(0);
      setGameOver(false);
    } catch (error) {
      alert("Failed to load card. Please try again.");
    }
    setLoading(false);
  }

  // Handle drawing the card image
  useEffect(() => {
    if (!card) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Black overlay
      ctx.fillStyle = "black";
      const revealHeight = canvas.height * (revealed / 10);
      ctx.fillRect(0, revealHeight, canvas.width, canvas.height - revealHeight);
    };
    
    img.src = card.artUrl;
  }, [card, revealed]);

  // Handle guess submission
  function handleGuess(e) {
    e.preventDefault();
    if (!guess.trim()) return;

    const newGuessCount = guesses + 1;
    setGuesses(newGuessCount);

    if (guess.toLowerCase() === card.name.toLowerCase()) {
      setGameOver(true);
      setRevealed(10);
      alert(`Correct! You guessed it in ${newGuessCount} tries!`);
    } else {
      const newRevealed = Math.min(revealed + 1, 10);
      setRevealed(newRevealed);
      if (newRevealed === 10) {
        setGameOver(true);
        alert(`Game Over! The card was ${card.name}`);
      }
    }
    setGuess('');
  }

  if (loading) {
    return <div className="loading">Loading card...</div>;
  }

  return (
    <div className="container">
      <h1 className="title">MTG Art Guesser</h1>
      
      {!card ? (
        <div className="card">
          <h2>How to Play</h2>
          <ul>
            <li>Try to guess the Magic card from its artwork</li>
            <li>Each wrong guess reveals more of the image</li>
            <li>You have 10 attempts to guess correctly</li>
          </ul>
          <button onClick={loadNewCard}>Start Game</button>
        </div>
      ) : (
        <div className="card">
          <canvas 
            ref={canvasRef}
            style={{ width: '100%', aspectRatio: '1.5' }}
          />
          
          {!gameOver ? (
            <form onSubmit={handleGuess}>
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter card name..."
              />
              <button type="submit">
                Guess ({guesses})
              </button>
            </form>
          ) : (
            <div className="game-over">
              <p>The card was: <strong>{card.name}</strong></p>
              <button onClick={loadNewCard}>
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
