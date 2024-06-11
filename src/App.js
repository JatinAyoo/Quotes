import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import bookmarkIcon from './assets/bookmark.png';
import bookmarkedIcon from './assets/bookmarked.png';

const App = () => {
  const [quote, setQuote] = useState('');
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [quoteBuffer, setQuoteBuffer] = useState([]);
  const toastId = React.useRef(null);

  useEffect(() => {
    // Load saved quotes from localStorage on initial render
    const savedQuotesFromStorage = localStorage.getItem('savedQuotes');
    if (savedQuotesFromStorage) {
      setSavedQuotes(JSON.parse(savedQuotesFromStorage));
    }
    fetchQuotes(3); // Fetch initial batch of quotes
  }, []);

  useEffect(() => {
    // Save quotes to localStorage whenever savedQuotes changes
    localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  const fetchQuotes = async (count = 3) => {
    try {
      const response = await axios.get(`https://ron-swanson-quotes.herokuapp.com/v2/quotes/${count}`);
      setQuote(response.data[0]); // Set the first quote from the fetched batch
      setQuoteBuffer(response.data.slice(1)); // Set remaining quotes to buffer
    } catch (error) {
      console.error('Error fetching the quotes', error);
    }
  };

  const getNextQuote = () => {
    if (quoteBuffer.length > 0) {
      setQuote(quoteBuffer[0]); // Set the next quote from the buffer
      setQuoteBuffer(prevBuffer => prevBuffer.slice(1)); // Remove the displayed quote from buffer
    } else {
      fetchQuotes(1).then(() => {
        if (quoteBuffer.length > 0) {
          setQuote(quoteBuffer[0]); // Set the next quote from the buffer
          setQuoteBuffer(prevBuffer => prevBuffer.slice(1)); // Remove the displayed quote from buffer
        }
      });
    }
  };

  const toggleSaveQuote = (currentQuote) => {
    if (savedQuotes.includes(currentQuote)) {
      setSavedQuotes(savedQuotes.filter(q => q !== currentQuote));
      toast.info('Quote removed from saved!', { toastId: 'quote-toast' });
    } else {
      setSavedQuotes([...savedQuotes, currentQuote]);
      toast.success('Quote saved!', { toastId: 'quote-toast' });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav className="navbar">
          <h1>Ron Swanson Quotes</h1>
        </nav>
        <div className="quote-container">
          <div className="quote-card">
            <div className="quote-text">
              <p>{quote}</p>
            </div>
            <div className="bookmark-icon-container">
              <img
                src={savedQuotes.includes(quote) ? bookmarkedIcon : bookmarkIcon}
                alt="Bookmark Icon"
                className="bookmark-icon"
                onClick={() => toggleSaveQuote(quote)}
              />
            </div>
          </div>
          <button onClick={getNextQuote} className="new-quote-button">New Quote</button>
        </div>
        <div className="saved-quotes">
          <h2>Saved Quotes</h2>
          {savedQuotes.map((q, index) => (
            <div key={index} className="quote-card">
              <div className="quote-text">
                <p>{q}</p>
              </div>
              <div className="bookmark-icon-container">
                <img
                  src={bookmarkedIcon}
                  alt="Bookmarked Icon"
                  className="bookmark-icon"
                  onClick={() => toggleSaveQuote(q)}
                />
              </div>
            </div>
          ))}
        </div>
      </header>
      <ToastContainer />
    </div>
  );
};

export default App;
