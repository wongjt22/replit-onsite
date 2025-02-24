import { useState, useEffect } from 'react';
import { Editor } from './Editor';
import { resetSessionId } from '../utils';

interface Tab {
  id: string;
  name: string;
}

interface HistoryItem {
  value: unknown;
  isUserCommand: boolean;
  isError?: boolean;
}

interface TabHistory {
  [tabId: string]: HistoryItem[];
}

export const EditorTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>([{ id: crypto.randomUUID(), name: 'Console 1' }]);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [tabHistories, setTabHistories] = useState<TabHistory>({
    [tabs[0].id]: []
  });

  useEffect(() => {
    resetSessionId(tabs[0].id);
  }, []);

  const updateHistory = (tabId: string, input: string, result: unknown, isError?: boolean) => {
    setTabHistories(prev => ({
      ...prev,
      [tabId]: [
        ...(prev[tabId] || []),
        { value: input, isUserCommand: true },
        { value: result, isUserCommand: false, isError }
      ]
    }));
  };

  const createNewTab = () => {
    const newTab = {
      id: crypto.randomUUID(),
      name: `Console ${tabs.length + 1}`
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
    setTabHistories(prev => ({
      ...prev,
      [newTab.id]: []
    }));
    resetSessionId(newTab.id);
  };

  const handleTabClick = (tabId: string) => {
    console.log('Switching to tab:', tabId);
    setActiveTab(tabId);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTab === tabId) {
      const newActiveTab = newTabs[newTabs.length - 1].id;
      setActiveTab(newActiveTab);
    }

    setTabHistories(prev => {
      const newHistories = { ...prev };
      delete newHistories[tabId];
      return newHistories;
    });
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        display: 'flex', 
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333'
      }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === tab.id ? '#000' : '#1a1a1a',
              color: '#0f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRight: '1px solid #333'
            }}
          >
            {tab.name}
            {tabs.length > 1 && (
              <button
                onClick={(e) => closeTab(tab.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0f0',
                  cursor: 'pointer',
                  padding: '0 4px'
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={createNewTab}
          style={{
            background: 'none',
            border: 'none',
            color: '#0f0',
            cursor: 'pointer',
            padding: '8px 16px',
            fontSize: '16px'
          }}
        >
          +
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <Editor 
          key={activeTab}
          tabId={activeTab}
          history={tabHistories[activeTab] || []}
          onHistoryUpdate={updateHistory}
        />
      </div>
    </div>
  );
};
