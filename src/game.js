import React, { useState, useEffect, useRef } from "react";
import "./index.css";

function App() {
  const [card, setCard] = useState(null);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const canvasRef = useRef(null);

  // Function to fetch a new card from Scryfall API
  async function loadNewCard() {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.scryfall.com/cards/random?q=is:hires+has:art_crop"
      );
      const data = await response.json();
      setCard({
        name: data.name,
        artUrl: data.image_uris?.art_crop || "",
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

  // Fetch autocomplete suggestions from Scryfall API
  async function handleInputChange(e) {
    const value = e.target.value;
    setGuess(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/autocomplete?q=${value}`
      );
      const data = await response.json();
      setSuggestions(data.data || []);
    } catch (error) {
      console.error("Error fetching card suggestions:", error);
    }
  }

  // Select a suggestion from the dropdown
  function selectSuggestion(card) {
    setGuess(card);
    setSuggestions([]);
  }

  // Function to handle guess submission
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
    setGuess("");
  }

  // Function to draw the card with an overlay
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

      ctx.fillStyle = "black";
      const revealHeight = canvas.height * (revealed / 10);
      ctx.fillRect(0, revealHeight, canvas.width, canvas.height - revealHeight);
    };

    img.src = card.artUrl;
  }, [card, revealed]);

  return (
    <div className="container">
      <h1 className="title">Wheely Hard</h1>

      {!card ? (
        <div className="card">
          <h2>How to Play</h2>
          <ul>
            <li>Guess the Magic card from its artwork.</li>
            <li>Each incorrect guess reveals more of the image.</li>
            <li>You have 10 attempts to guess correctly.</li>
          </ul>
          <button onClick={loadNewCard}>Start Game</button>
        </div>
      ) : (
        <div className="card">
          <canvas ref={canvasRef} style={{ width: "100%", aspectRatio: "1.5" }} />

          {!gameOver ? (
            <form onSubmit={handleGuess}>
              <input
                type="text"
                value={guess}
                onChange={handleInputChange}
                placeholder="Enter card name..."
                aria-label="Enter your card guess"
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
              <p>
                The card was: <strong>{card.name}</strong>
              </p>
              <button onClick={loadNewCard}>Play Again</button>
            </div>
          )}
        </div>
      )}

      {/* Patreon Button */}
      <div className="patreon-container">
        <a
          href="https://www.patreon.com/c/MercadianBazaars"
          target="_blank"
          rel="noopener noreferrer"
          className="patreon-button"
        >
          Support us on Patreon
        </a>
      </div>
    </div>
  );
}

export default App;
