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
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${value}`);
      const data = await response.json();
      setSuggestions(data.data || []);
    } catch (error) {
      console.error("Error fetching card suggestions:", error);
    }
  }

  function selectSuggestion(card) {
    setGuess(card);
    setSuggestions([]);
  }

  if (loading) {
    return <div className="loading">Loading card...</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Wheely Hard</h1>
      <div className="input-container">
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
      </div>
      <div className="patreon-container">
        <a href="https://www.patreon.com/c/MercadianBazaars" target="_blank" rel="noopener noreferrer">
          <button className="patreon-button">Support on Patreon</button>
        </a>
      </div>
    </div>
  );
}

export default App;
