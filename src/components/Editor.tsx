import { useState } from 'react'
import { evaluateCode } from '../utils'
import { ArrayToggle, ObjectToggle } from './CommandLineToggle'

interface CommandInputProps {
  onSubmit: (input: string) => Promise<void>;
}

const CommandInput = ({ onSubmit }: CommandInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(input);
    setInput("");
  };

  return (
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
  );
};

interface CommandLineProps {
  command: string;
}

const CommandLine = ({ command }: CommandLineProps) => {
  console.log(command, typeof command)
  if (command === undefined) {
    return <div>$ undefined</div>;
  }
  if (command === null) {
    return <div>$ null</div>;
  }

  if (Array.isArray(command)) {
    return <ArrayToggle command={command} />;
  }

  if (typeof command === 'object') {
    return <ObjectToggle command={command} />;
  }

  return (
    <div>$ {command}</div>
  );
};

interface CommandHistoryProps {
  history: string[];
}

const CommandHistory = ({ history }: CommandHistoryProps) => {
  return (
    <>
      {history.map((cmd, index) => (
        <CommandLine key={index} command={cmd} />
      ))}
    </>
  );
};

export const Editor = () => {
  const [history, setHistory] = useState([]);

  const handleCommand = async (input: string) => {
    try {
      const result = await evaluateCode(input);
      setHistory([...history, input, result]);
    } catch (error) {
      console.error('Error evaluating code:', error);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#0f0',
        padding: '1rem',
        fontFamily: 'monospace',
        minHeight: '100vh',
        width: '100vw',
        boxSizing: 'border-box',
        margin: 0,
      }}
    >
      <CommandHistory history={history} />
      <CommandInput onSubmit={handleCommand} />
    </div>
  );
}
