import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildGeminiContents, parseUserMessage } from '../services/gemini';
import type { ChatMessage } from '../services/gemini';

// Mock Google Gen AI SDK
const { generateContentMock } = vi.hoisted(() => {
  return {
    generateContentMock: vi.fn(),
  };
});

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: generateContentMock,
      };
    },
  };
});

describe('Gemini Service & Context Flow', () => {
  beforeEach(() => {
    generateContentMock.mockReset();
  });

  describe('buildGeminiContents', () => {
    it('should build a simple user prompt when history is empty', () => {
      const result = buildGeminiContents([], 'fiz 3x10 flexões');
      expect(result).toEqual([
        {
          role: 'user',
          parts: [{ text: 'fiz 3x10 flexões' }],
        },
      ]);
    });

    it('should filter out error messages and thinking loaders', () => {
      const history: ChatMessage[] = [
        { text: 'fiz 3x10 flexões', sender: 'user' },
        { text: 'Pensando...', sender: 'bot' },
        { text: 'Erro ao se comunicar...', sender: 'bot', isError: true },
        { text: 'Entendi: 3x10 Flexão. Confirma?', sender: 'bot' },
      ];

      const result = buildGeminiContents(history, 'sim');
      expect(result).toEqual([
        {
          role: 'user',
          parts: [{ text: 'fiz 3x10 flexões' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendi: 3x10 Flexão. Confirma?' }],
        },
        {
          role: 'user',
          parts: [{ text: 'sim' }],
        },
      ]);
    });

    it('should merge consecutive messages of the same sender', () => {
      const history: ChatMessage[] = [
        { text: 'Olá!', sender: 'user' },
        { text: 'quero treinar hoje', sender: 'user' },
        { text: 'Legal!', sender: 'bot' },
        { text: 'Vamos lá!', sender: 'bot' },
      ];

      const result = buildGeminiContents(history, 'fiz 10 flexões');
      expect(result).toEqual([
        {
          role: 'user',
          parts: [{ text: 'Olá!\nquero treinar hoje' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Legal!\nVamos lá!' }],
        },
        {
          role: 'user',
          parts: [{ text: 'fiz 10 flexões' }],
        },
      ]);
    });

    it('should drop initial model messages to ensure history starts with user role', () => {
      const history: ChatMessage[] = [
        { text: 'Olá, sou o CalisBot!', sender: 'bot' },
        { text: 'Oi, tudo bem?', sender: 'user' },
        { text: 'Tudo ótimo!', sender: 'bot' },
      ];

      const result = buildGeminiContents(history, 'quero treinar');
      expect(result).toEqual([
        {
          role: 'user',
          parts: [{ text: 'Oi, tudo bem?' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Tudo ótimo!' }],
        },
        {
          role: 'user',
          parts: [{ text: 'quero treinar' }],
        },
      ]);
    });
  });

  describe('parseUserMessage with history', () => {
    it('should call generateContent with mapped contents history', async () => {
      generateContentMock.mockResolvedValue({
        text: '{"isWorkout": true, "isCalisthenics": true, "exercicios": [{"nome": "Flexão", "series": 3, "repeticoes": 10, "observacao": ""}]}',
      });

      const history: ChatMessage[] = [
        { text: 'fiz 3x10 flexões', sender: 'user' },
        { text: 'Entendi: 3x10 Flexão. Confirma?', sender: 'bot' },
        { text: 'sim', sender: 'user' },
        { text: 'Treino registrado!', sender: 'bot' },
      ];

      const result = await parseUserMessage('dummy-key', 'dummy-model', 'e mais 5', history);

      expect(generateContentMock).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'dummy-model',
          contents: [
            { role: 'user', parts: [{ text: 'fiz 3x10 flexões' }] },
            { role: 'model', parts: [{ text: 'Entendi: 3x10 Flexão. Confirma?' }] },
            { role: 'user', parts: [{ text: 'sim' }] },
            { role: 'model', parts: [{ text: 'Treino registrado!' }] },
            { role: 'user', parts: [{ text: 'e mais 5' }] },
          ],
        })
      );

      expect(result).toEqual({
        isWorkout: true,
        isCalisthenics: true,
        exercicios: [{ nome: 'Flexão', series: 3, repeticoes: 10, observacao: '' }],
      });
    });

    it('should inject contextData into systemInstruction', async () => {
      generateContentMock.mockResolvedValue({
        text: '{"isWorkout": false, "isCalisthenics": true, "respostaConversacional": "Você fez 10 flexões ontem."}',
      });

      const contextData = {
        planoAtivo: { nome: 'Plano Legal', nivel: 'iniciante', dias: [] },
        historicoTreinos: [{ data: '2026-06-25', exercicios_realizados: [{ nome: 'Flexão', series: 1, repeticoes: 10 }] }],
        dataAtual: '2026-06-26',
        diaSemanaAtual: 'Sexta-feira',
      };

      await parseUserMessage('dummy-key', 'dummy-model', 'o que treinei ontem?', [], contextData);

      expect(generateContentMock).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: expect.stringContaining('ESTADO ATUAL DO USUÁRIO'),
          }),
        })
      );

      expect(generateContentMock).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: expect.stringContaining('Plano Legal'),
          }),
        })
      );
    });
  });
});
