import { useState, useEffect } from 'react'
import { evaluateCode, resetSessionId } from '../utils'
import { ArrayToggle, ObjectToggle } from './CommandLineToggle'

interface CommandInputProps {
  onSubmit: (input: string) => Promise<void>;
  history: HistoryItem[];
}

const CommandInput = ({ onSubmit, history }: CommandInputProps) => {
  const [input, setInput] = useState("");
  const [historyPosition, setHistoryPosition] = useState(-1);
  const [savedInput, setSavedInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();

      // Get all user commands from history
      const userCommands = history.filter(item => item.isUserCommand).map(item => String(item.value));

      if (e.key === 'ArrowUp') {
        if (historyPosition === -1) {
          setSavedInput(input);
        }

        if (historyPosition < userCommands.length - 1) {
          const newPosition = historyPosition + 1;
          setHistoryPosition(newPosition);
          setInput(userCommands[userCommands.length - 1 - newPosition]);
        }
      } else if (e.key === 'ArrowDown') {
        if (historyPosition > -1) {
          const newPosition = historyPosition - 1;
          setHistoryPosition(newPosition);
          setInput(newPosition === -1 ? savedInput : userCommands[userCommands.length - 1 - newPosition]);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(input);
    setInput("");
    setHistoryPosition(-1);
    setSavedInput("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
      <span style={{ flexShrink: 0, marginRight: '0.5rem' }}>&gt;&gt;&gt; </span>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
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

  if (value === undefined) {
    return <div>undefined</div>;
  }
  if (value === null) {
    return <div>null</div>;
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

interface EditorProps {
  tabId: string;
  history: HistoryItem[];
  onHistoryUpdate: (tabId: string, input: string, result: unknown, isError?: boolean) => void;
}

export const Editor = ({ tabId, history, onHistoryUpdate }: EditorProps) => {
  const handleCommand = async (input: string) => {
    try {
      const result = await evaluateCode(input, tabId);
      onHistoryUpdate(tabId, input, result);
    } catch (error) {
      console.error('Error evaluating code:', error);
      onHistoryUpdate(tabId, input, error instanceof Error ? error.message : 'Unknown error', true);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#0f0',
        padding: '1rem',
        fontFamily: 'monospace',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        margin: 0,
        overflow: 'auto'
      }}
    >
      <CommandHistory history={history} />
      <CommandInput onSubmit={handleCommand} history={history} />
    </div>
  );
}