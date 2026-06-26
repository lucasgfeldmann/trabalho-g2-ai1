import { useState, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import type { Message } from './components/ChatWindow';
import { SettingsPanel } from './components/SettingsPanel';
import { db } from './db/db';
import { parseUserMessage, generateCalisthenicsPlan } from './services/gemini';
import type { ParsedWorkout, GeneratedPlan } from './services/gemini';

interface PlanFlow {
  step: 'none' | 'confirm_replace' | 'level' | 'days' | 'goal' | 'confirm_plan';
  nivel?: string;
  diasPorSemana?: number;
  objetivo?: string;
  planoGerado?: any;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'plan'>('chat');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3-flash-preview');
  const [customModel, setCustomModel] = useState('');

  // Confirmation Flow states
  const [pendingWorkout, setPendingWorkout] = useState<ParsedWorkout[] | null>(null);
  const [planFlow, setPlanFlow] = useState<PlanFlow>({ step: 'none' });
  const [pendingIAPlan, setPendingIAPlan] = useState<GeneratedPlan | null>(null);
  const [pendingPlanAction, setPendingPlanAction] = useState<'create_plan' | 'edit_plan' | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState('');

  const checkPlanAndInit = async (keyToUse = apiKey) => {
    if (!keyToUse) return;
    try {
      const planos = await db.plano_ativo.toArray();
      if (planos.length === 0) {
        setPlanFlow({ step: 'level' });
        setMessages((prev) => {
          const introductionSent = prev.some((m) =>
            m.text.includes('Escolha o seu nível de experiência')
          );
          if (introductionSent) return prev;

          return [
            ...prev,
            {
              id: `bot-intro-plan-${Date.now()}`,
              text: 'Olá! Vejo que você ainda não possui um plano de treino active. Vamos criar um juntos! 🚀\n\nEscolha o seu nível de experiência na calistenia:',
              sender: 'bot',
              timestamp: new Date(),
            },
          ];
        });
      }
    } catch (err) {
      console.error('Erro ao verificar plano ativo:', err);
    }
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-3-flash-preview';
    const savedCustom = localStorage.getItem('gemini_custom_model') || '';

    setApiKey(savedKey);
    setModel(savedModel);
    setCustomModel(savedCustom);

    if (savedKey) {
      setTimeout(() => {
        checkPlanAndInit(savedKey);
      }, 100);
    }
  }, []);

  const handleSaveSettings = (newKey: string, newModel: string, newCustom: string) => {
    const isNewKeyAdded = !apiKey && newKey;

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

    if (isNewKeyAdded || (newKey && messages.length === 0)) {
      setTimeout(() => {
        checkPlanAndInit(newKey);
      }, 100);
    }
  };

  const handleConfirm = async () => {
    if (!pendingWorkout) return;

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const mappedWorkout = pendingWorkout.map((ex) => ({
      ...ex,
      hora_realizacao: ex.hora_realizacao || time,
    }));

    try {
      // RN-002: Multiple workouts in the same day belong to the same session
      const existingSession = await db.historico_treinos.where('data').equals(today).first();

      if (existingSession) {
        existingSession.exercicios_realizados.push(...mappedWorkout);
        await db.historico_treinos.put(existingSession);
      } else {
        await db.historico_treinos.add({
          data: today,
          hora_inicio: time,
          exercicios_realizados: mappedWorkout,
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

  const handleShowPlan = async () => {
    try {
      const planos = await db.plano_ativo.toArray();
      if (planos.length > 0) {
        const plano = planos[0];
        let text = `📋 **Seu Plano Ativo: ${plano.nome}**\n💪 Nível: ${plano.nivel.toUpperCase()}\n📅 Criado em: ${new Date(plano.criado_em).toLocaleDateString()}\n\n`;

        plano.dias.forEach((dia) => {
          text += `**${dia.dia_semana}**:\n`;
          dia.exercicios.forEach((ex) => {
            text += `- ${ex.nome}: ${ex.series}x${ex.repeticoes}\n`;
          });
          text += '\n';
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-show-plan-${Date.now()}`,
            text: text.trim(),
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-no-plan-${Date.now()}`,
            text: 'Você não possui nenhum plano ativo no momento. Gostaria de criar um?',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        setPlanFlow({ step: 'level' });
      }
    } catch (err) {
      console.error('Erro ao buscar plano ativo:', err);
    }
  };

  const handleInitiatePlanFlow = async () => {
    try {
      const planos = await db.plano_ativo.toArray();
      if (planos.length > 0) {
        setPlanFlow({ step: 'confirm_replace' });
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-confirm-replace-${Date.now()}`,
            text: 'Você já possui um plano ativo. Deseja substituí-lo por um novo?',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      } else {
        setPlanFlow({ step: 'level' });
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-level-start-${Date.now()}`,
            text: 'Vamos criar um novo plano de treino! Escolha o seu nível de experiência na calistenia:',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error('Erro ao verificar substituição de plano:', err);
    }
  };

  const formatPlanText = (plano: any) => {
    let txt = `📋 **Sugestão de Plano: ${plano.nome}**\n💪 Nível: ${plano.nivel.toUpperCase()}\n\n`;
    plano.dias.forEach((dia: any) => {
      txt += `**${dia.dia_semana}**:\n`;
      dia.exercicios.forEach((ex: any) => {
        txt += `- ${ex.nome}: ${ex.series}x${ex.repeticoes}\n`;
      });
      txt += '\n';
    });
    txt += `Deseja salvar este plano como seu plano ativo?`;
    return txt;
  };

  const handleGeneratePlan = async (nivel: string, dias: number, objetivo: string) => {
    const activeModel = model === 'custom' ? customModel : model;

    if (!navigator.onLine) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-offline-${Date.now()}`,
          text: 'Parece que você está sem conexão com a internet. O CalisBot necessita de internet para gerar o plano via Gemini API.',
          sender: 'bot',
          timestamp: new Date(),
          isError: true,
        },
      ]);
      setPlanFlow({ step: 'none' });
      return;
    }

    const thinkingId = `thinking-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        text: 'Gerando seu plano semanal com Gemini... Aguarde um instante.',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);

    try {
      const plano = await generateCalisthenicsPlan(apiKey, activeModel, nivel, dias, objetivo);

      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));

      const formattedText = formatPlanText(plano);

      setPlanFlow((prev) => ({
        ...prev,
        step: 'confirm_plan',
        planoGerado: plano,
      }));

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-plan-generated-${Date.now()}`,
          text: formattedText,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));
      console.error(err);

      const isAuthError =
        err.message?.includes('API key') ||
        err.message?.includes('API_KEY_INVALID') ||
        err.status === 400 ||
        err.status === 403;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          text: isAuthError
            ? 'Erro ao gerar o plano. Verifique se sua API Key do Gemini está correta e ativa.'
            : `Houve um problema ao gerar o plano via Gemini API: ${err.message || 'Erro desconhecido'}.`,
          sender: 'bot',
          timestamp: new Date(),
          isError: true,
        },
      ]);
      // Em vez de resetar o plano para 'none', mantemos o passo como 'goal' para permitir retry!
      setPlanFlow((prev) => ({ ...prev, step: 'goal' }));
    }
  };

  const getQuickOptions = () => {
    if (pendingWorkout) {
      return ['Confirmar', 'Cancelar'];
    }
    if (pendingIAPlan) {
      return ['Confirmar Plano', 'Cancelar'];
    }
    if (planFlow.step === 'confirm_replace') {
      return ['Sim, substituir', 'Não'];
    }
    if (planFlow.step === 'level') {
      return ['Iniciante', 'Intermediário', 'Avançado'];
    }
    if (planFlow.step === 'days') {
      return ['3 dias', '4 dias', '5 dias'];
    }
    if (planFlow.step === 'goal') {
      return ['Força', 'Resistência', 'Habilidades'];
    }
    if (planFlow.step === 'confirm_plan') {
      return ['Confirmar Plano', 'Cancelar'];
    }
    return [];
  };

  const handleRetry = async () => {
    if (planFlow.step === 'goal' && planFlow.nivel && planFlow.diasPorSemana && planFlow.objetivo) {
      setMessages((prev) => {
        const lastErrIndex = [...prev].reverse().findIndex(m => m.isError);
        if (lastErrIndex !== -1) {
          const actualIndex = prev.length - 1 - lastErrIndex;
          return prev.filter((_, idx) => idx !== actualIndex);
        }
        return prev;
      });
      await handleGeneratePlan(planFlow.nivel, planFlow.diasPorSemana, planFlow.objetivo);
      return;
    }

    if (!lastUserMessage) return;

    setMessages((prev) => {
      const lastErrIndex = [...prev].reverse().findIndex(m => m.isError);
      if (lastErrIndex !== -1) {
        const actualIndex = prev.length - 1 - lastErrIndex;
        return prev.filter((_, idx) => idx !== actualIndex);
      }
      return prev;
    });

    await handleProcessMessage(lastUserMessage, true);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    await handleProcessMessage(text, false);
  };

  const handleProcessMessage = async (text: string, isRetry = false) => {
    if (pendingWorkout) {
      const isYes = /^(sim|s|yes|y|confirmar|confirma|confirmado|confirmar treino)$/i.test(text.trim());
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

    if (pendingIAPlan) {
      const isYes = /^(sim|s|yes|y|confirmar|salvar|confirmar plano|salvar plano)$/i.test(text.trim());
      const isNo = /^(n[aã]o|nao|n|no|cancelar)$/i.test(text.trim());

      if (isYes) {
        try {
          await db.plano_ativo.clear();
          await db.plano_ativo.add({
            nome: pendingIAPlan.nome,
            nivel: pendingIAPlan.nivel,
            criado_em: new Date().toISOString(),
            dias: pendingIAPlan.dias,
          });

          setMessages((prev) => [
            ...prev,
            {
              id: `bot-plan-saved-${Date.now()}`,
              text: pendingPlanAction === 'edit_plan'
                ? 'Plano atualizado com sucesso no banco de dados local! 💪'
                : 'Plano salvo com sucesso! Agora ele é o seu plano ativo. Para visualizá-lo a qualquer momento, digite "ver meu plano". 💪',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        } catch (err) {
          console.error('Erro ao salvar plano da IA:', err);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-plan-save-err-${Date.now()}`,
              text: 'Erro ao salvar o plano no banco de dados local.',
              sender: 'bot',
              timestamp: new Date(),
              isError: true,
            },
          ]);
        } finally {
          setPendingIAPlan(null);
          setPendingPlanAction(null);
        }
      } else if (isNo) {
        setPendingIAPlan(null);
        setPendingPlanAction(null);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-plan-cancelled-${Date.now()}`,
            text: pendingPlanAction === 'edit_plan' ? 'Alterações de plano canceladas.' : 'Criação de plano cancelada.',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-confirm-plan-retry-${Date.now()}`,
            text: 'Por favor, confirme respondendo "sim" ou "não" (ou utilize os botões de confirmação rápidos).',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
      return;
    }

    if (planFlow.step !== 'none') {
      const input = text.trim();

      if (planFlow.step === 'confirm_replace') {
        const isYes = /^(sim|s|yes|y|substituir|confirmar|sim, substituir)$/i.test(input);
        const isNo = /^(n[aã]o|nao|n|no|cancelar)$/i.test(input);

        if (isYes) {
          setPlanFlow({ step: 'level' });
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-level-${Date.now()}`,
              text: 'Escolha o seu nível de experiência na calistenia:',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        } else if (isNo) {
          setPlanFlow({ step: 'none' });
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-replace-cancelled-${Date.now()}`,
              text: 'Substituição cancelada. Mantendo o seu plano ativo atual.',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-replace-retry-${Date.now()}`,
              text: 'Opção inválida. Deseja substituir seu plano ativo atual por um novo?',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        }
        return;
      }

      if (planFlow.step === 'level') {
        const lowerInput = input.toLowerCase();
        let selectedLevel = '';
        if (lowerInput.includes('iniciante')) {
          selectedLevel = 'iniciante';
        } else if (lowerInput.includes('intermediário') || lowerInput.includes('intermediario')) {
          selectedLevel = 'intermediario';
        } else if (lowerInput.includes('avançado') || lowerInput.includes('avancado')) {
          selectedLevel = 'avancado';
        }

        if (selectedLevel) {
          setPlanFlow((prev) => ({ ...prev, step: 'days', nivel: selectedLevel }));
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-days-${Date.now()}`,
              text: 'Quantos dias por semana você deseja treinar? (Opções recomendadas: 3 dias, 4 dias ou 5 dias)',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-level-retry-${Date.now()}`,
              text: 'Nível inválido. Escolha entre: Iniciante, Intermediário ou Avançado.',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        }
        return;
      }

      if (planFlow.step === 'days') {
        const match = input.match(/(\d+)/);
        const dias = match ? parseInt(match[1]) : 0;

        if (dias >= 3 && dias <= 5) {
          setPlanFlow((prev) => ({ ...prev, step: 'goal', diasPorSemana: dias }));
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-goal-${Date.now()}`,
              text: 'Qual é o seu principal objetivo? (Opções: Força, Resistência ou Habilidades)',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-days-retry-${Date.now()}`,
              text: 'Número de dias inválido. Por favor, escolha 3 dias, 4 dias ou 5 dias.',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        }
        return;
      }

      if (planFlow.step === 'goal') {
        const lowerInput = input.toLowerCase();
        let selectedGoal = '';
        if (lowerInput.includes('força') || lowerInput.includes('forca')) {
          selectedGoal = 'Força';
        } else if (lowerInput.includes('resistência') || lowerInput.includes('resistencia')) {
          selectedGoal = 'Resistência';
        } else if (lowerInput.includes('habilidade') || lowerInput.includes('habilidades')) {
          selectedGoal = 'Habilidades';
        }

        if (selectedGoal) {
          const nivel = planFlow.nivel!;
          const dias = planFlow.diasPorSemana!;
          setPlanFlow((prev) => ({ ...prev, step: 'confirm_plan', objetivo: selectedGoal }));
          await handleGeneratePlan(nivel, dias, selectedGoal);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-goal-retry-${Date.now()}`,
              text: 'Objetivo inválido. Escolha entre: Força, Resistência ou Habilidades.',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        }
        return;
      }

      if (planFlow.step === 'confirm_plan') {
        const isConfirm = /^(confirmar|confirmar plano|salvar|sim|s)$/i.test(input);
        const isCancel = /^(cancelar|n[aã]o|nao|n)$/i.test(input);

        if (isConfirm && planFlow.planoGerado) {
          try {
            await db.plano_ativo.clear();
            await db.plano_ativo.add({
              nome: planFlow.planoGerado.nome,
              nivel: planFlow.planoGerado.nivel,
              criado_em: new Date().toISOString(),
              dias: planFlow.planoGerado.dias,
            });

            setMessages((prev) => [
              ...prev,
              {
                id: `bot-plan-saved-${Date.now()}`,
                text: 'Plano salvo com sucesso! Agora ele é o seu plano ativo. Para visualizá-lo a qualquer momento, digite "ver meu plano". 💪',
                sender: 'bot',
                timestamp: new Date(),
              },
            ]);
          } catch (err) {
            console.error('Erro ao salvar plano:', err);
            setMessages((prev) => [
              ...prev,
              {
                id: `bot-plan-save-err-${Date.now()}`,
                text: 'Erro ao salvar o plano no banco de dados local.',
                sender: 'bot',
                timestamp: new Date(),
                isError: true,
              },
            ]);
          } finally {
            setPlanFlow({ step: 'none' });
          }
        } else if (isCancel) {
          setPlanFlow({ step: 'none' });
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-plan-cancelled-${Date.now()}`,
              text: 'Criação de plano cancelada.',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-confirm-plan-retry-${Date.now()}`,
              text: 'Opção inválida. Por favor, clique em "Confirmar Plano" ou "Cancelar".',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        }
        return;
      }
    }

    const normalizedInput = text.trim().toLowerCase();

    const isShowPlanCommand = /^(ver meu plano|ver plano|plano|mostrar plano|mostrar meu plano)$/i.test(normalizedInput);
    if (isShowPlanCommand) {
      await handleShowPlan();
      return;
    }

    const isCreatePlanCommand = /^(criar plano|novo plano|gerar plano|mudar plano|gerar um plano|criar um plano)$/i.test(normalizedInput);
    if (isCreatePlanCommand) {
      await handleInitiatePlanFlow();
      return;
    }

    const isHistoryCommand = /^(ver hist[oó]rico|hist[oó]rico|ver historico|historico)$/i.test(normalizedInput);
    if (isHistoryCommand) {
      setActiveTab('history');
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-open-history-${Date.now()}`,
          text: 'Abrindo o seu histórico de treinos... 📅',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      return;
    }

    if (!isRetry) {
      setLastUserMessage(text);
    }

    const activeModel = model === 'custom' ? customModel : model;

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
      let userMsgIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].sender === 'user' && messages[i].text === text) {
          userMsgIndex = i;
          break;
        }
      }
      const historyForGemini = userMsgIndex !== -1 ? messages.slice(0, userMsgIndex) : messages;

      // Recupera dados do banco local (IndexedDB) para dar contexto à IA
      const activePlans = await db.plano_ativo.toArray();
      const planoAtivo = activePlans.length > 0 ? activePlans[0] : undefined;

      const allHistory = await db.historico_treinos.toArray();
      const sortedHistory = allHistory.sort((a, b) => b.data.localeCompare(a.data));
      const historicoTreinos = sortedHistory.slice(0, 15);

      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const contextData = {
        planoAtivo,
        historicoTreinos,
        dataAtual: new Date().toISOString().split('T')[0],
        diaSemanaAtual: diasSemana[new Date().getDay()],
      };

      const result = await parseUserMessage(apiKey, activeModel, text, historyForGemini, contextData);

      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));

      if (!result.isCalisthenics) {
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
      } else if (result.action && result.planoGeral) {
        setPendingIAPlan(result.planoGeral);
        setPendingPlanAction(result.action);
        
        let planDetails = `📋 **Plano Sugerido: ${result.planoGeral.nome}**\n`;
        planDetails += `💪 Nível: ${result.planoGeral.nivel.toUpperCase()}\n\n`;
        result.planoGeral.dias.forEach((dia) => {
          planDetails += `**${dia.dia_semana}**:\n`;
          dia.exercicios.forEach((ex) => {
            planDetails += `- ${ex.nome}: ${ex.series}x${ex.repeticoes}\n`;
          });
          planDetails += '\n';
        });

        const actionText = result.action === 'edit_plan' ? 'Deseja salvar estas alterações no seu plano ativo?' : 'Deseja salvar este novo plano como seu plano ativo?';
        const explainText = result.respostaConversacional ? `${result.respostaConversacional}\n\n` : '';

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-plan-confirm-${Date.now()}`,
            text: explainText + planDetails + actionText,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      } else {
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
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));
      console.error(err);

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
        onOpenHistory={() => setActiveTab('history')}
        onRetry={handleRetry}
        hasApiKey={!!apiKey}
        quickOptions={getQuickOptions()}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
