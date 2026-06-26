import React, { useState, useRef, useEffect } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isError?: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  onSend: (text: string) => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  pendingConfirmation?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSend,
  onOpenSettings,
  hasApiKey,
  pendingConfirmation = false,
  onConfirm,
  onCancel,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API support
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognition;

  useEffect(() => {
    if (isSpeechSupported) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'pt-BR';

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        setInputText(transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [isSpeechSupported, SpeechRecognition]);

  // Auto-scroll to bottom whenever messages update
  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleRecording = () => {
    if (!isSpeechSupported) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setInputText('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start recognition', err);
      }
    }
  };

  const getMicTitle = () => {
    if (!isSpeechSupported) return 'Reconhecimento de voz não suportado neste navegador.';
    if (!hasApiKey) return 'Configure a API Key para conversar por voz.';
    return isRecording ? 'Gravando voz... Clique para parar.' : 'Gravar por voz (Clique único)';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Stop recording if active on send
    if (isRecording) {
      recognitionRef.current?.stop();
    }

    onSend(inputText.trim());
    setInputText('');
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div className="bot-info">
          <div className="bot-avatar">🤖</div>
          <div>
            <h3>CalisBot</h3>
            <span className="status-indicator">Ativo</span>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn settings-toggle"
          onClick={onOpenSettings}
          title="Configurações do Gemini"
          aria-label="Abrir configurações"
        >
          ⚙️
        </button>
      </header>

      {/* Message Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="welcome-container">
            <div className="welcome-card">
              <h2>Bem-vindo ao CalisBot! 💪</h2>
              <p>
                Eu sou seu assistente de Calistenia. Posso te ajudar a gerenciar seus planos de treino e registrar seus exercícios realizados por voz ou texto.
              </p>
              {!hasApiKey && (
                <div className="warning-banner">
                  <p>⚠️ <strong>Chave de API não configurada!</strong></p>
                  <p>Para interagir com o bot, você precisa fornecer uma chave de API do Gemini nas configurações.</p>
                  <button type="button" className="primary-btn mt-2" onClick={onOpenSettings}>
                    Configurar Agora
                  </button>
                </div>
              )}
              {hasApiKey && (
                <p className="hint-text mt-4">
                  Digite ou fale algo como: <em>"fiz 3x10 flexões"</em> ou <em>"me ajude a criar um plano"</em> para começarmos!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-bubble-wrapper ${
                  msg.sender === 'user' ? 'user-wrapper' : 'bot-wrapper'
                }`}
              >
                <div
                  className={`message-bubble ${
                    msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'
                  } ${msg.isError ? 'error-bubble' : ''}`}
                >
                  <p>{msg.text}</p>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="chat-input-bar">
        {pendingConfirmation && (
          <div className="confirmation-actions">
            <button type="button" className="primary-btn confirm-action-btn" onClick={onConfirm}>
              Confirmar 👍
            </button>
            <button type="button" className="secondary-btn cancel-action-btn" onClick={onCancel}>
              Cancelar 👎
            </button>
          </div>
        )}
        {!hasApiKey && messages.length > 0 && (
          <div className="input-warning-banner">
            A API Key do Gemini está ausente. <button onClick={onOpenSettings}>Configurar Chave</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="input-form">
          <button
            type="button"
            className={`icon-btn mic-btn ${isRecording ? 'recording' : ''}`}
            title={getMicTitle()}
            disabled={!hasApiKey || !isSpeechSupported}
            onClick={toggleRecording}
            aria-label={isRecording ? 'Parar gravação de voz' : 'Gravar comando por voz'}
          >
            🎤
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder={
              hasApiKey
                ? "Envie uma mensagem ou diga o que treinou..."
                : "Configure a API Key para conversar..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!hasApiKey}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!hasApiKey || !inputText.trim()}
            aria-label="Enviar mensagem"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};
