import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [card, setCard] = useState(null);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const canvasRef = useRef(null);

  // Load a random card
 async function loadNewCard() {
  setLoading(true);
  try {
    const response = await fetch(
      "https://api.scryfall.com/cards/random?q=is:hires+has:art_crop+"
      + "(set:lea OR set:leb OR set:2ed OR set:3ed OR set:4ed OR set:5ed OR "
      + "set:6ed OR set:7ed OR set:8ed OR set:9ed OR set:10e OR set:m10 OR "
      + "set:m11 OR set:m12 OR set:m13 OR set:m14 OR set:m15 OR "
      + "set:ice OR set:all OR set:mir OR set:vis OR set:wth OR set:tmp OR "
      + "set:str OR set:usg OR set:ulg OR set:uds OR set:mmq OR set:nem OR "
      + "set:pcY OR set:inv OR set:pls OR set:apc OR set:ody OR set:tor OR "
      + "set:jud OR set:onr OR set:lgn OR set:scg OR set:mrd OR set:dst OR "
      + "set:5dn OR set:chk OR set:bok OR set:sok OR set:rav OR set:gtc OR "
      + "set:dgm OR set:ths OR set:jou OR set:ori OR set:bfz OR set:ogw OR "
      + "set:soi OR set:emn OR set:kld OR set:aer OR set:akh OR set:hou OR "
      + "set:xln OR set:rix OR set:dom OR set:m19 OR set:grn OR set:rna OR "
      + "set:war OR set:m20 OR set:eld OR set:thb OR set:iko OR set:m21 OR "
      + "set:znr OR set:khm OR set:stx OR set:afr OR set:mid OR set:vow OR "
      + "set:neo OR set:snc OR set:dmu)"
    );
    const data = await response.json();
    setCard({
      name: data.name,
      artUrl: data.image_uris?.art_crop || ""
    });
    setGuesses(0);
    setRevealed(0);
    setGameOver(false);
  } catch (error) {
    alert("Failed to load card. Please try again.");
    console.error(error);
  }
  setLoading(false);
}
  // Fetch card name suggestions from Scryfall
  async function handleInputChange(e) {
    const value = e.target.value;
    setGuess(value);

    if (value.length < 3) {
      setSuggestions([]); // Don't fetch if input is too short
      return;
    }

    try {
      const response = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${value}`);
      const data = await response.json();
      setSuggestions(data.data || []); // Update state with suggestions
    } catch (error) {
      console.error("Error fetching card suggestions:", error);
    }
  }

  function selectSuggestion(card) {
    setGuess(card);
    setSuggestions([]); // Hide dropdown after selection
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

    // Draw Patreon support text
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Support us on Patreon: patreon.com/c/MercadianBazaars", canvas.width / 2, canvas.height - 20);

      
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

    setGuesses((prev) => prev + 1);

    if (guess.toLowerCase() === card.name.toLowerCase()) {
      setGameOver(true);
      setRevealed(10);
      alert(`Correct! You guessed the card in ${guesses + 1} tries!`);
    } else {
      setRevealed((prev) => {
        const newRevealed = Math.min(prev + 1, 10);
        if (newRevealed === 10) {
          setGameOver(true);
          alert(`Game Over! The card was ${card.name}`);
        }
        return newRevealed;
      });
    }
    setGuess('');
  }

  if (loading) {
    return <div className="loading">Loading card...</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Wheely Hard</h1>
      
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
                onChange={handleInputChange}
                placeholder="Enter card name..."
              />

              {suggestions.length > 0 && (
                <ul className="dropdown">
                  {suggestions.map((card) => (
                    <li key={card} onClick={() => selectSuggestion(card)}>
                      {card}
                    </li>
                  ))}
                </ul>
              )}
              
              <button type="submit">Guess ({guesses})</button>
            </form>
          ) : (
            <div className="game-over">
              <p>The card was: <strong>{card.name}</strong></p>
              <button onClick={loadNewCard}>Play Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
