import { useState, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import type { Message } from './components/ChatWindow';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3-flash-preview');
  const [customModel, setCustomModel] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-3-flash-preview';
    const savedCustom = localStorage.getItem('gemini_custom_model') || '';

    setApiKey(savedKey);
    setModel(savedModel);
    setCustomModel(savedCustom);
  }, []);

  const handleSaveSettings = (newKey: string, newModel: string, newCustom: string) => {
    if (newKey) {
      localStorage.setItem('gemini_api_key', newKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    localStorage.setItem('gemini_model', newModel);
    localStorage.setItem('gemini_custom_model', newCustom);

    setApiKey(newKey);
    setModel(newModel);
    setCustomModel(newCustom);
  };

  const handleSendMessage = (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Simple bot reply mock for UI testing
    setTimeout(() => {
      const activeModel = model === 'custom' ? customModel : model;
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        text: `Entendido! Você disse: "${text}". [Simulado usando o modelo ${activeModel}]`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      <ChatWindow
        messages={messages}
        onSend={handleSendMessage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!apiKey}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialApiKey={apiKey}
        initialModel={model}
        initialCustomModel={customModel}
      />
    </>
  );
}

export default App;
