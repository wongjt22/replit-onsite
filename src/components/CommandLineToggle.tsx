import { useState } from 'react';

interface ArrayToggleProps {
  command: unknown;
}

export const ArrayToggle = ({ command }: ArrayToggleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!Array.isArray(command)) {
    return null;
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const renderValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return <ArrayToggle command={value} />;
    }
    if (typeof value === 'object' && value !== null) {
      return <ObjectToggle command={value} />;
    }
    return typeof value === 'string' ? `"${value}"` : String(value);
  };

  const renderArrayContents = () => {
    const protoMethods = Object.getOwnPropertyNames(Array.prototype)
      .filter(name => typeof Array.prototype[name] === 'function');

    return (
      <div style={{ marginLeft: '20px' }}>
        {command.map((item, index) => (
          <div key={index}>
            {index}: {renderValue(item)}
          </div>
        ))}
        <div>length: {command.length}</div>
        <div 
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <details>
            <summary>[[Prototype]]: Array({command.length})</summary>
            <div style={{ marginLeft: '20px' }}>
              {protoMethods.map(method => (
                <div key={method}>{method}: ƒ</div>
              ))}
            </div>
          </details>
        </div>
      </div>
    );
  };

  return (
    <div onClick={toggleExpand} style={{ cursor: 'pointer' }}>
      <span style={{ display: 'inline-block', width: '10px', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
        ▶
      </span>
      ({command.length}) [{command.join(', ')}]
      {isExpanded && renderArrayContents()}
    </div>
  );
}

interface ObjectToggleProps {
  command: unknown;
}

export const ObjectToggle = ({ command }: ObjectToggleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (typeof command !== 'object' || command === null || Array.isArray(command)) {
    return null;
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const renderValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return <ArrayToggle command={value} />;
    }
    if (typeof value === 'object' && value !== null) {
      return <ObjectToggle command={value} />;
    }
    return typeof value === 'string' ? `"${value}"` : String(value);
  };

  const renderObjectContents = () => {
    const entries = Object.entries(command);
    const protoMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(command))
      .filter(name => typeof Object.getPrototypeOf(command)[name] === 'function');

    return (
      <div style={{ marginLeft: '20px' }}>
        {entries.map(([key, value]) => (
          <div key={key}>
            {key}: {renderValue(value)}
          </div>
        ))}
        <div 
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <details>
            <summary>[[Prototype]]: Object</summary>
            <div style={{ marginLeft: '20px' }}>
              {protoMethods.map(method => (
                <div key={method}>{method}: ƒ</div>
              ))}
            </div>
          </details>
        </div>
      </div>
    );
  };

  const entries = Object.entries(command);
  return (
    <div onClick={toggleExpand} style={{ cursor: 'pointer' }}>
      <span style={{ display: 'inline-block', width: '10px', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
        ▶
      </span>
      {'{'}
      {!isExpanded && entries.length > 0 && '…'}
      {!isExpanded && entries.length === 0 && ' '}
      {'}'}
      {isExpanded && renderObjectContents()}
    </div>
  );
};