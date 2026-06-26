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

export async function parseUserMessage(
  apiKey: string,
  modelName: string,
  text: string
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
    const response = await ai.models.generateContent({
      model: modelName,
      contents: text,
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
