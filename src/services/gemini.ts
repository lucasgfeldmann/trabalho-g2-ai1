import { GoogleGenAI } from '@google/genai';

export interface ParsedWorkout {
  nome: string;
  series: number;
  repeticoes: number;
  observacao: string;
  hora_realizacao?: string;
}

export interface ParseResult {
  isWorkout: boolean;
  isCalisthenics: boolean;
  data?: string;
  exercicios?: ParsedWorkout[];
  respostaConversacional?: string;
  action?: 'create_plan' | 'edit_plan';
  planoGeral?: GeneratedPlan;
}

export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  isError?: boolean;
}

export interface UserContextData {
  planoAtivo?: any;
  historicoTreinos?: any[];
  dataAtual: string;
  diaSemanaAtual: string;
  pendingWorkout?: ParsedWorkout[];
  pendingIAPlan?: GeneratedPlan;
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
  history: ChatMessage[] = [],
  contextData?: UserContextData
): Promise<ParseResult> {
  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction = `
Você é o interpretador de comandos do CalisBot, um chatbot de calistenia.
Sua tarefa é analisar a mensagem de treino enviada pelo usuário e extrair os exercícios realizados.

Você deve responder APENAS com um objeto JSON estruturado (sem markdown blocks).
Se a mensagem for sobre calistenia e descrever exercícios realizados, retorne no formato:
{
  "isWorkout": true,
  "isCalisthenics": true,
  "data": "YYYY-MM-DD", // Data identificada a partir do texto do usuário se houver menção de data ou dia específico (ex: "ontem", "anteontem", "terça passada", etc.). Caso o usuário não informe a data ou dia, defina como null.
  "exercicios": [
    {
      "nome": "Flexão" | "Barra" | "Muscle Up" | "Dip" | "Agachamento" | "Archer Push-Up" | "Flexão Diamante" | "L-Sit" | "Handstand" | "Pistol Squat" | "Lunge" | "Prancha" | "Hollow Body",
      "series": number,
      "repeticoes": number,
      "observacao": string
    }
  ]
}

Se o usuário pedir para CRIAR um novo plano de treinos (ex: "crie um plano iniciante de 3 dias", "gere um treino de força", "crie uma rotina de exercícios", etc.) ou para EDITAR o plano de treinos ativo existente (ex: "adicione dips na segunda-feira", "remova flexão de quarta", "mude séries de barra para 4", etc.):
{
  "isWorkout": false,
  "isCalisthenics": true,
  "respostaConversacional": "Uma mensagem amigável explicando o plano gerado ou as alterações feitas.",
  "action": "create_plan" | "edit_plan",
  "planoGeral": {
    "nome": string (ex: "Treino de Força Iniciante" ou "Plano Customizado"),
    "nivel": "iniciante" | "intermediario" | "avancado",
    "dias": [
      {
        "dia_semana": "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo",
        "exercicios": [
          {
            "nome": "Flexão" | "Barra" | "Muscle Up" | "Dip" | "Agachamento" | "Archer Push-Up" | "Flexão Diamante" | "L-Sit" | "Handstand" | "Pistol Squat" | "Lunge" | "Prancha" | "Hollow Body",
            "series": number,
            "repeticoes": number
          }
        ]
      }
    ]
  }
}
No caso de "edit_plan", analise o "PLANO DE TREINO ATIVO DO USUÁRIO" fornecido no contexto abaixo, realize as alterações solicitadas (adicionar, remover ou modificar exercícios, séries ou repetições) e retorne a estrutura do plano modificado COMPLETO no campo "planoGeral".

REGRAS DE EQUIPAMENTO PARA CRIAÇÃO E EDIÇÃO DE PLANOS:
Ao criar ou editar planos, garanta que todos os exercícios sejam estritamente de calistenia livre e sem equipamentos (usando apenas o peso corporal). Não inclua de forma alguma pesos livres, halteres, anilhas ou máquinas de academia. Apenas barras fixas e barras paralelas são permitidas como auxílio.

Se a mensagem for sobre calistenia mas NÃO for um registro de exercício nem uma ação de plano (ex: comprimentos, perguntas gerais de treino):
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

  if (contextData) {
    systemInstruction += `

ESTADO ATUAL DO USUÁRIO:
- Data de hoje: ${contextData.dataAtual} (${contextData.diaSemanaAtual})

OPERAÇÕES PENDENTES DE CONFIRMAÇÃO (SE HOUVER):
${contextData.pendingWorkout ? `- Treino pendente atual: ${JSON.stringify(contextData.pendingWorkout)}` : ''}
${contextData.pendingIAPlan ? `- Plano pendente atual: ${JSON.stringify(contextData.pendingIAPlan)}` : ''}

PLANO DE TREINO ATIVO DO USUÁRIO:
${contextData.planoAtivo ? JSON.stringify(contextData.planoAtivo, null, 2) : 'Nenhum plano ativo registrado.'}

HISTÓRICO RECENTE DE TREINOS DO USUÁRIO:
${contextData.historicoTreinos && contextData.historicoTreinos.length > 0 ? JSON.stringify(contextData.historicoTreinos, null, 2) : 'Nenhum treino realizado ainda.'}

DIRETRIZES IMPORTANTES DE CORREÇÃO:
Se o usuário estiver fornecendo uma correção (a mensagem começa com "[SOLICITAÇÃO DE CORREÇÃO DO USUÁRIO]:" ou se refere explicitamente a corrigir a operação pendente atual):
1. Analise o que está pendente no contexto ("Treino pendente atual" ou "Plano pendente atual").
2. Aplique a modificação solicitada pelo usuário (ex: alterar exercícios, séries, repetições, observações ou a data do treino/plano).
3. Se estiver corrigindo um treino, retorne o JSON estruturado contendo a nova lista de exercícios corrigida com "isWorkout": true, e inclua também o campo "data" com a data correta (calculada caso o usuário tenha corrigido o dia do treino, ex: "mude a data para ontem").
4. Se estiver corrigindo um plano, retorne o JSON com "action": "create_plan" ou "edit_plan", e "planoGeral" contendo o plano de treinos completo com a correção aplicada.
5. Escreva no campo "respostaConversacional" uma explicação bem curta e objetiva confirmando as correções que você realizou.

DIRETRIZES DE RECONHECIMENTO DE DATAS NO REGISTRO DE TREINO:
- Se a mensagem do usuário (ou a correção) indicar que o treino foi realizado em um dia específico (como "ontem", "anteontem", "terça-feira passada", "na última quarta", "dia 20/06", "dia 15", etc.), calcule e retorne a data exata correspondente no formato "YYYY-MM-DD" no campo "data" no nível superior do JSON.
- Para calcular as datas relativas com precisão, utilize a "Data de hoje" fornecida no contexto. Por exemplo, se hoje é 2026-06-26 (Sexta-feira):
  - "ontem" corresponde a "2026-06-25"
  - "anteontem" corresponde a "2026-06-24"
  - "terça-feira" ou "terça" ou "terça passada" corresponde a "2026-06-23"
  - "segunda-feira passada" ou "segunda passada" corresponde a "2026-06-22"
- Se a mensagem NÃO mencionar nenhuma data ou dia de treino, o campo "data" deve ser retornado como null ou omitido (o que subentende o dia de hoje).

Se o usuário perguntar sobre o seu plano de treino, sobre o seu histórico de treinos (ex: o que treinou hoje, o que fez ontem, se bateu a meta, quantos exercícios já fez, etc.), responda à pergunta na chave "respostaConversacional" usando as informações acima de forma amigável, clara e motivadora.
`;
  }

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

REGRAS CRÍTICAS PARA OS EXERCÍCIOS:
1. O plano de treino deve ser FOCADO EXCLUSIVAMENTE EM CALISTENIA SEM EQUIPAMENTOS (utilizando apenas o peso corporal e a gravidade).
2. Não inclua em hipótese alguma aparelhos de academia, pesos, halteres, anilhas, polias, ou qualquer máquina externa de musculação.
3. Exercícios permitidos incluem apenas barras fixas de calistenia (pull up/chin up) e paralelas (dips) que são estruturas urbanas públicas tradicionais de calistenia. Todo o restante deve ser peso corporal livre no solo (flexões, agachamentos livres, pistolas, handstand, prancha, etc.).

Mantenha a coerência nos treinos:
- Iniciantes devem ter exercícios básicos (Flexão, Barra com auxílio, Agachamento, Prancha) com volumes menores (ex: 3 séries de 8 a 10).
- Intermediários e Avançados podem ter exercícios mais difíceis (Muscle Up, Pistol Squat, L-Sit, Dips) com volumes maiores.
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Gere um plano para nível ${nivel}, com ${diasPorSemana} dias de treino semanal, focado em ${objetivo}. Lembre-se: todos os exercícios gerados devem ser de calistenia e sem equipamentos, usando apenas o peso corporal.`,
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
