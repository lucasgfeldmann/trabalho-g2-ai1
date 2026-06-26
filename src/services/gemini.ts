import { GoogleGenAI } from '@google/genai';

export interface ParsedWorkout {
  nome: string;
  series: number;
  repeticoes: number;
  observacao: string;
}

export interface ParseResult {
  isWorkout: boolean;
  isCalisthenics: boolean;
  exercicios?: ParsedWorkout[];
  respostaConversacional?: string;
}

export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  isError?: boolean;
}

export function buildGeminiContents(
  history: ChatMessage[],
  currentPrompt: string
): any[] {
  const filtered = history.filter((msg) => {
    if (msg.isError) return false;
    const txt = msg.text.trim();
    if (!txt) return false;
    if (txt === 'Pensando...') return false;
    if (txt.includes('Gerando seu plano semanal com Gemini')) return false;
    return true;
  });

  const rawTurns: { role: 'user' | 'model'; text: string }[] = filtered.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    text: msg.text,
  }));

  rawTurns.push({ role: 'user', text: currentPrompt });

  const mergedTurns: { role: 'user' | 'model'; text: string }[] = [];
  for (const turn of rawTurns) {
    const lastMerged = mergedTurns[mergedTurns.length - 1];
    if (lastMerged && lastMerged.role === turn.role) {
      lastMerged.text += '\n' + turn.text;
    } else {
      mergedTurns.push({ ...turn });
    }
  }

  while (mergedTurns.length > 0 && mergedTurns[0].role !== 'user') {
    mergedTurns.shift();
  }

  return mergedTurns.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
}

export async function parseUserMessage(
  apiKey: string,
  modelName: string,
  text: string,
  history: ChatMessage[] = []
): Promise<ParseResult> {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
Você é o interpretador de comandos do CalisBot, um chatbot de calistenia.
Sua tarefa é analisar a mensagem de treino enviada pelo usuário e extrair os exercícios realizados.

Você deve responder APENAS com um objeto JSON estruturado (sem markdown blocks).
Se a mensagem for sobre calistenia e descrever exercícios realizados, retorne no formato:
{
  "isWorkout": true,
  "isCalisthenics": true,
  "exercicios": [
    {
      "nome": "Flexão" | "Barra" | "Muscle Up" | "Dip" | "Agachamento" | "Archer Push-Up" | "Flexão Diamante" | "L-Sit" | "Handstand" | "Pistol Squat" | "Lunge" | "Prancha" | "Hollow Body",
      "series": number,
      "repeticoes": number,
      "observacao": string
    }
  ]
}

Se a mensagem for sobre calistenia mas NÃO for um registro de exercício (ex: comprimentos, perguntas gerais de treino):
{
  "isWorkout": false,
  "isCalisthenics": true,
  "respostaConversacional": "Sua resposta conversacional aqui."
}

Se a mensagem NÃO for sobre calistenia, treinos ou saúde relacionada a exercícios (violando o guardrail RN-005):
{
  "isWorkout": false,
  "isCalisthenics": false,
  "respostaConversacional": "Desculpe, mas eu sou o CalisBot e meu propósito exclusivo é ajudar com treinos de calistenia. Como posso ajudar com sua rotina de exercícios hoje?"
}

Mapeie os exercícios para os nomes catalogados padronizados:
- Flexão (inclui flexão diamante, diamante, archer push-up, push up, pushup, flexão comum)
- Barra (inclui barra fixa, pull up, chin up, barra)
- Muscle Up (inclui muscleup, muscle-up)
- Dip (inclui dip, dips, paralela, tríceps na paralela)
- L-Sit (inclui l-sit, l sit)
- Handstand (inclui handstand, parada de mão, bananeira)
- Agachamento (inclui agachamento, agachamento livre, squat)
- Pistol Squat (inclui pistol squat, pistol)
- Lunge (inclui lunge, avanço, passada)
- Prancha (inclui prancha isométrica, plank)
- Hollow Body (inclui hollow body, canoinha)

Se o número de séries não for mencionado (ex: "fiz 15 flexões"), assuma series = 1 e repeticoes = 15.
Se for mencionado "3x10 flexões" ou "3 séries de 10 flexões", series = 3 e repeticoes = 10.
`;

  try {
    const contents = buildGeminiContents(history, text);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Resposta vazia da API do Gemini.');
    }

    let cleanedText = responseText;
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    }

    const parsed: ParseResult = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error('Error parsing message with Gemini:', error);
    throw error;
  }
}

export interface GeneratedPlan {
  nome: string;
  nivel: string;
  dias: {
    dia_semana: string;
    exercicios: {
      nome: string;
      series: number;
      repeticoes: number;
    }[];
  }[];
}

export async function generateCalisthenicsPlan(
  apiKey: string,
  modelName: string,
  nivel: string,
  diasPorSemana: number,
  objetivo: string
): Promise<GeneratedPlan> {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
Você é o criador de planos de calistenia do CalisBot.
Sua tarefa é gerar um plano de treino semanal de calistenia estruturado em formato JSON.

Você deve responder APENAS com um objeto JSON estruturado (sem markdown blocks), que obedeça exatamente ao seguinte schema:
{
  "nome": string,
  "nivel": string ("iniciante" | "intermediario" | "avancado"),
  "dias": [
    {
      "dia_semana": string ("Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo"),
      "exercicios": [
        {
          "nome": string ("Flexão" | "Barra" | "Muscle Up" | "Dip" | "Agachamento" | "Archer Push-Up" | "Flexão Diamante" | "L-Sit" | "Handstand" | "Pistol Squat" | "Lunge" | "Prancha" | "Hollow Body"),
          "series": number,
          "repeticoes": number
        }
      ]
    }
  ]
}

Gere exatamente ${diasPorSemana} dias de treino por semana com base nos parâmetros:
- Nível: ${nivel}
- Objetivo: ${objetivo}

Mantenha a coerência nos treinos:
- Iniciantes devem ter exercícios básicos (Flexão, Barra com auxílio, Agachamento, Prancha) com volumes menores (ex: 3 séries de 8 a 10).
- Intermediários e Avançados podem ter exercícios mais difíceis (Muscle Up, Pistol Squat, L-Sit, Dips) com volumes maiores.
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Gere um plano para nível ${nivel}, com ${diasPorSemana} dias de treino semanal, focado em ${objetivo}.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Resposta vazia da API do Gemini.');
    }

    let cleanedText = responseText;
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    }

    const parsed: GeneratedPlan = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error('Error generating plan with Gemini:', error);
    throw error;
  }
}
