import { useState, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import type { Message } from './components/ChatWindow';
import { SettingsPanel } from './components/SettingsPanel';
import { db } from './db/db';
import { parseUserMessage } from './services/gemini';
import type { ParsedWorkout } from './services/gemini';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3-flash-preview');
  const [customModel, setCustomModel] = useState('');

  // Confirmation Flow states
  const [pendingWorkout, setPendingWorkout] = useState<ParsedWorkout[] | null>(null);

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

  const handleConfirm = async () => {
    if (!pendingWorkout) return;

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      // RN-002: Multiple workouts in the same day belong to the same session
      const existingSession = await db.historico_treinos.where('data').equals(today).first();

      if (existingSession) {
        existingSession.exercicios_realizados.push(...pendingWorkout);
        await db.historico_treinos.put(existingSession);
      } else {
        await db.historico_treinos.add({
          data: today,
          hora_inicio: time,
          exercicios_realizados: pendingWorkout,
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-success-${Date.now()}`,
          text: 'Treino registrado com sucesso no histórico do dia! 💪',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error('Error saving workout:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          text: 'Erro ao salvar treino no banco local.',
          sender: 'bot',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setPendingWorkout(null);
    }
  };

  const handleCancel = () => {
    setPendingWorkout(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-cancel-${Date.now()}`,
        text: 'Registro cancelado. Pode enviar o comando novamente se desejar.',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async (text: string) => {
    // 1. Add User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2. If in Confirmation Flow
    if (pendingWorkout) {
      const isYes = /^(sim|s|yes|y|confirmar|confirma|confirmado)$/i.test(text.trim());
      const isNo = /^(n[aã]o|nao|n|no|cancelar|cancelado)$/i.test(text.trim());

      if (isYes) {
        await handleConfirm();
      } else if (isNo) {
        handleCancel();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-retry-${Date.now()}`,
            text: 'Por favor, confirme respondendo "sim" ou "não" (ou utilize os botões de confirmação rápidos).',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
      return;
    }

    // 3. Normal Flow - Query Gemini API
    const activeModel = model === 'custom' ? customModel : model;

    // Check internet connection
    if (!navigator.onLine) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-offline-${Date.now()}`,
          text: 'Parece que você está sem conexão com a internet. O CalisBot necessita de internet para processar as mensagens via Gemini API.',
          sender: 'bot',
          timestamp: new Date(),
          isError: true,
        },
      ]);
      return;
    }

    // Add thinking placeholder
    const thinkingId = `thinking-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        text: 'Pensando...',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);

    try {
      const result = await parseUserMessage(apiKey, activeModel, text);

      // Remove thinking placeholder
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));

      if (!result.isCalisthenics) {
        // Guardrail triggered
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-guard-${Date.now()}`,
            text: result.respostaConversacional || 'Desculpe, mas meu escopo é focado em calistenia.',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (result.isWorkout && result.exercicios && result.exercicios.length > 0) {
        setPendingWorkout(result.exercicios);
        const workoutSummary = result.exercicios
          .map((e) => `- ${e.nome}: ${e.series} série(s) de ${e.repeticoes} repetição(ões) ${e.observacao ? `(${e.observacao})` : ''}`)
          .join('\n');

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-confirm-${Date.now()}`,
            text: `Entendi o seguinte treino:\n\n${workoutSummary}\n\nConfirma o registro?`,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      } else {
        // Normal conversational reply
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-reply-${Date.now()}`,
            text: result.respostaConversacional || 'Entendido!',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: any) {
      // Remove thinking placeholder
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));
      console.error(err);

      // Identify API key/auth errors vs connection/rate limits
      const isAuthError = err.message?.includes('API key') || err.message?.includes('API_KEY_INVALID') || err.status === 400 || err.status === 403;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          text: isAuthError
            ? 'Erro ao se comunicar com a API do Gemini. Verifique se sua API Key configurada está correta e ativa.'
            : `Houve um problema de conexão ou erro com a API do Gemini: ${err.message || 'Erro desconhecido'}.`,
          sender: 'bot',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }
  };

  return (
    <>
      <ChatWindow
        messages={messages}
        onSend={handleSendMessage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!apiKey}
        pendingConfirmation={!!pendingWorkout}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
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
