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
    <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
      <span style={{ flexShrink: 0, marginRight: '0.5rem' }}>&gt;&gt;&gt; </span>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          backgroundColor: 'transparent',
          color: '#0f0',
          border: 'none',
          outline: 'none',
          width: '100%',
          flexGrow: 1,
          fontFamily: 'inherit',
          fontSize: 'inherit',
          padding: 0,
          margin: 0
        }}
        autoFocus
      />
    </form>
  );
};

interface HistoryItem {
  value: unknown;
  isUserCommand: boolean;
  isError?: boolean;
}

interface CommandHistoryProps {
  history: HistoryItem[];
}

interface CommandLineProps {
  command: HistoryItem;
}

const CommandLine = ({ command }: CommandLineProps) => {
  const { value, isUserCommand, isError } = command;
  console.log(value, typeof value);

  if (value === undefined) {
    return <div>&gt undefined</div>;
  }
  if (value === null) {
    return <div>&gt null</div>;
  }

  if (Array.isArray(value)) {
    return <ArrayToggle command={value} />;
  }

  if (typeof value === 'object') {
    return <ObjectToggle command={value} />;
  }
  return (
    <div style={{ color: isError ? '#f00' : '#0f0' }}>
      {isUserCommand ? '>' : ''} {isUserCommand || isError ? String(value) : (typeof value === 'string' ? `"${value}"` : String(value))}
    </div>
  );
};

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
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleCommand = async (input: string) => {
    try {
      const result = await evaluateCode(input);
      setHistory([
        ...history,
        { value: input, isUserCommand: true },
        { value: result, isUserCommand: false }
      ]);
    } catch (error) {
      console.error('Error evaluating code:', error);
      setHistory([
        ...history,
        { value: input, isUserCommand: true },
        { value: error instanceof Error ? error.message : 'Unknown error', isUserCommand: false, isError: true }
      ]);
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
