import { useState } from 'react'
import { evaluateCode } from './utils'


export const Editor = () => {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await evaluateCode(input);
      setHistory([...history, input, result]);
      console.log('Evaluation result:', result);
    } catch (error) {
      console.error('Error evaluating code:', error);
    }
    setInput("");
  };

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#0f0',
        padding: '1rem',
        fontFamily: 'monospace',
        minHeight: '300px'
      }}
    >
      {history.map((cmd, index) => (
        <div key={index}>$ {cmd}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <span>$ </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            backgroundColor: 'transparent',
            color: '#0f0',
            border: 'none',
            outline: 'none'
          }}
          autoFocus
        />
      </form>
    </div>
  );
}
