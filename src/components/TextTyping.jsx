import React, { useState, useEffect } from 'react';

const TextTyping = () => {
  const [paragraphs, setParagraphs] = useState('');
  const [inputText, setInputText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(null);

  useEffect(() => {
    generateParagraphs();
  }, []);

  useEffect(() => {
    if (remainingTime === 0) {
      handleSubmit();
    }
  }, [remainingTime]);

  const generateParagraphs = async () => {
    try {
      const response = await fetch(
        'https://baconipsum.com/api/?type=meat-and-filler&paras=1&sentences=1&format=text&start-with-lorem=1&words=7'
      );
      if (response.ok) {
        const data = await response.text();
        setParagraphs(data);
      } else {
        throw new Error('Failed to fetch random paragraphs');
      }
    } catch (error) {
      console.log(error);
    }
  };
  

  const handleInputChange = (e) => {
    if (practiceStarted) {
      // Reset the typing practice if already started
      resetTypingPractice();
    } else {
      // Start the timer when the input field is focused
      setStartTime(new Date());
      setEndTime(null);
      setAccuracy(0);
      setWordCount(0);
      setPracticeStarted(true);
      setRemainingTime(300);
      setTimeTaken(null);
      setTimeout(() => {
        handleSubmit();
      }, 300000); // 5 minutes in milliseconds
    }
    setInputText(e.target.value);
  };

  const resetTypingPractice = () => {
    setInputText('');
    setStartTime(null);
    setEndTime(null);
    setAccuracy(0);
    setWordCount(0);
    setRemainingTime(300);
    setTimeTaken(null);
    clearTimeout();
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    setEndTime(new Date());
    calculateAccuracy();
    calculateWordCount();
    setPracticeStarted(false); // Stop the timer
    calculateTimeTaken();
  };

  const calculateAccuracy = () => {
    const correctChar = paragraphs.replace(/\s/g, '').length;
    const typedCharacters = inputText.replace(/\s/g, '').length;
    const currentAccuracy = (typedCharacters / correctChar) * 100;
    setAccuracy(currentAccuracy.toFixed(2));
  };

  const calculateWordCount = () => {
    const words = inputText.trim().split(/\s+/);
    setWordCount(words.length);
  };

  const calculateTimeTaken = () => {
    if (startTime && endTime) {
      const duration = (endTime - startTime) / 1000;
      setTimeTaken(duration.toFixed(2));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (remainingTime > 0 && practiceStarted) {
      const timer = setTimeout(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [remainingTime, practiceStarted]);

  const renderResult = () => {
    if (endTime) {
      return (
        <div className="result">
          <p>Accuracy: {accuracy}%</p>
          <p>Words Typed: {wordCount}</p>
          {timeTaken && <p>Time Taken: {timeTaken} seconds</p>}
        </div>
      );
    }
    return null;
  };

  const handleReset = () => {
    resetTypingPractice();
  };

  return (
    <div className="container">
      <h1>Typing Practice</h1>
      <pre className="code">{paragraphs}</pre>
      <form onSubmit={handleSubmit}>
        <textarea className="editor" value={inputText} onChange={handleInputChange} onFocus={handleInputChange} />
        <div className="button-row">
          <button className="submit-button" type="submit">Submit</button>
          <button className="reset-button" onClick={handleReset}>Reset</button>
        </div>
      </form>
      {practiceStarted && (
        <div className="timer">Time Remaining: <span>{formatTime(remainingTime)}</span></div>
      )}
      {renderResult()}
    </div>
  );
};

export default TextTyping;
