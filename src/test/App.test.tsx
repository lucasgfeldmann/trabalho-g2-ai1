import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import App from '../App'
import { ChatWindow } from '../components/ChatWindow'
import { db } from '../db/db'

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

describe('CalisBot App & Components', () => {
  beforeEach(async () => {
    localStorage.clear()
    await db.historico_treinos.clear()
    await db.plano_ativo.clear()
    generateContentMock.mockReset()
  })

  afterEach(() => {
    delete (window as any).SpeechRecognition
    delete (window as any).webkitSpeechRecognition
  })

  it('renders welcome screen when open for the first time without API key', () => {
    render(<App />)
    expect(screen.getByText('CalisBot')).toBeInTheDocument()
    expect(screen.getByText(/Chave de API não configurada!/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Configure a API Key para conversar.../i)).toBeDisabled()
  })

  it('opens and closes settings panel', async () => {
    render(<App />)
    const settingsBtn = screen.getByLabelText('Abrir configurações')
    fireEvent.click(settingsBtn)

    expect(screen.getByText('Configurações do Gemini')).toBeInTheDocument()

    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(screen.queryByText('Configurações do Gemini')).not.toBeInTheDocument()
    })
  })

  it('saves and clears the API Key and model in settings panel', async () => {
    render(<App />)

    // Open settings
    fireEvent.click(screen.getByLabelText('Abrir configurações'))

    // Type API Key
    const apiKeyInput = screen.getByLabelText('Gemini API Key')
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key-123' } })

    // Change model
    const modelSelect = screen.getByLabelText('Modelo de IA')
    fireEvent.change(modelSelect, { target: { value: 'gemini-1.5-pro' } })

    // Submit form
    const saveBtn = screen.getByText('Salvar')
    fireEvent.click(saveBtn)

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByText('Configurações do Gemini')).not.toBeInTheDocument()
    })

    // Key is saved in localStorage and input is enabled
    expect(localStorage.getItem('gemini_api_key')).toBe('test-api-key-123')
    expect(localStorage.getItem('gemini_model')).toBe('gemini-1.5-pro')
    expect(screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)).toBeEnabled()

    // Clear settings
    fireEvent.click(screen.getByLabelText('Abrir configurações'))
    const clearBtn = screen.getByText('Limpar Tudo')
    fireEvent.click(clearBtn)

    // Key is removed
    expect(localStorage.getItem('gemini_api_key')).toBeNull()
    expect(screen.getByPlaceholderText(/Configure a API Key para conversar.../i)).toBeDisabled()
  })

  it('successfully parses workout message, triggers confirmation, saves to IndexedDB', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    // Mock Gemini successful workout parsing response
    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        isWorkout: true,
        isCalisthenics: true,
        exercicios: [
          { nome: 'Flexão', series: 3, repeticoes: 10, observacao: 'Archer' }
        ]
      })
    })

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'fiz 3x10 flexões archer' } })

    const sendBtn = screen.getByLabelText('Enviar mensagem')
    fireEvent.click(sendBtn)

    // Verify user message is displayed immediately
    expect(screen.getByText('fiz 3x10 flexões archer')).toBeInTheDocument()

    // Wait for Gemini mock results to trigger the confirmation bubble and buttons
    await waitFor(() => {
      expect(screen.getByText(/Entendi o seguinte treino:/i)).toBeInTheDocument()
      expect(screen.getByText(/Flexão: 3 série\(s\) de 10 repetição\(ões\) \(Archer\)/i)).toBeInTheDocument()
    })

    // Click Confirm quick action button
    const confirmBtn = screen.getByRole('button', { name: /^Confirmar$/i })
    fireEvent.click(confirmBtn)

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Treino registrado com sucesso no histórico do dia!/i)).toBeInTheDocument()
    })

    // Verify saved workout exists in Dexie IndexedDB
    const savedWorkouts = await db.historico_treinos.toArray()
    expect(savedWorkouts).toHaveLength(1)
    expect(savedWorkouts[0].exercicios_realizados[0].nome).toBe('Flexão')
    expect(savedWorkouts[0].exercicios_realizados[0].series).toBe(3)
    expect(savedWorkouts[0].exercicios_realizados[0].repeticoes).toBe(10)
    expect(savedWorkouts[0].exercicios_realizados[0].observacao).toBe('Archer')
  })

  it('declines confirmation and cancels the workout logging', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        isWorkout: true,
        isCalisthenics: true,
        exercicios: [
          { nome: 'Barra', series: 1, repeticoes: 15, observacao: '' }
        ]
      })
    })

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'fiz 15 barras' } })

    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    await waitFor(() => {
      expect(screen.getByText(/Entendi o seguinte treino:/i)).toBeInTheDocument()
    })

    // Click Cancel quick action button
    const cancelBtn = screen.getByRole('button', { name: /^Cancelar$/i })
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(screen.getByText(/Registro cancelado. Pode enviar o comando novamente se desejar./i)).toBeInTheDocument()
    })

    // Verify nothing is saved in IndexedDB
    const savedWorkouts = await db.historico_treinos.toArray()
    expect(savedWorkouts).toHaveLength(0)
  })

  it('applies guardrail if message is not related to calisthenics', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        isWorkout: false,
        isCalisthenics: false,
        respostaConversacional: 'Desculpe, mas eu sou o CalisBot e meu propósito exclusivo é ajudar com treinos de calistenia.'
      })
    })

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'qual a receita de bolo de chocolate?' } })

    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    await waitFor(() => {
      expect(screen.getByText(/Desculpe, mas eu sou o CalisBot e meu propósito exclusivo é ajudar com treinos de calistenia./i)).toBeInTheDocument()
    })
  })

  it('displays API key error message when Gemini call fails with invalid key error', async () => {
    localStorage.setItem('gemini_api_key', 'invalid-key')

    generateContentMock.mockRejectedValue(new Error('API key not valid'))

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'fiz 10 flexões' } })

    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    await waitFor(() => {
      expect(screen.getByText(/Erro ao se comunicar com a API do Gemini. Verifique se sua API Key configurada está correta/i)).toBeInTheDocument()
    })
  })

  it('displays offline error message when navigator.onLine is false', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    // Mock network offline state
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true
    })

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'fiz 10 flexões' } })

    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    await waitFor(() => {
      expect(screen.getByText(/Parece que você está sem conexão com a internet./i)).toBeInTheDocument()
    })

    // Reset online state
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
      configurable: true
    })
  })

  it('toggles recording and updates input with voice transcript from mock SpeechRecognition', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    const startMock = vi.fn()
    const stopMock = vi.fn()

    class MockSpeechRecognition {
      continuous = false
      interimResults = false
      lang = 'pt-BR'
      onstart = () => {}
      onresult = (_event: any) => {}
      onerror = (_event: any) => {}
      onend = () => {}

      start = startMock.mockImplementation(() => {
        this.onstart()
        setTimeout(() => {
          this.onresult({
            resultIndex: 0,
            results: [
              {
                isFinal: true,
                0: { transcript: 'fiz 3 séries de 10 flexões diamante' }
              }
            ]
          })
          this.stop()
        }, 50)
      })

      stop = stopMock.mockImplementation(() => {
        this.onend()
      })
      abort = vi.fn()
    }

    (window as any).SpeechRecognition = MockSpeechRecognition

    render(<App />)

    const micBtn = screen.getByLabelText('Gravar comando por voz')
    expect(micBtn).toBeEnabled()

    // Start recording
    fireEvent.click(micBtn)
    expect(startMock).toHaveBeenCalled()

    // Wait for the mock speech transcript to populate input
    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i) as HTMLInputElement
    await waitFor(() => {
      expect(input.value).toBe('fiz 3 séries de 10 flexões diamante')
    })

    // Click to stop
    fireEvent.click(micBtn)
    expect(stopMock).toHaveBeenCalled()
  })

  it('renders messages correctly in ChatWindow component', () => {
    const mockMessages = [
      { id: '1', text: 'Olá', sender: 'user' as const, timestamp: new Date() },
      { id: '2', text: 'Como posso ajudar?', sender: 'bot' as const, timestamp: new Date() }
    ]
    const onSend = vi.fn()
    const onOpenSettings = vi.fn()

    render(
      <ChatWindow
        messages={mockMessages}
        onSend={onSend}
        onOpenSettings={onOpenSettings}
        hasApiKey={true}
      />
    )

    expect(screen.getByText('Olá')).toBeInTheDocument()
    expect(screen.getByText('Como posso ajudar?')).toBeInTheDocument()
  })

  it('starts guided plan creation by asking for level if no active plan exists on mount', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Vejo que você ainda não possui um plano de treino active/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Iniciante$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Intermediário$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Avançado$/i })).toBeInTheDocument()
    })
  })

  it('completes guided plan creation flow and saves to IndexedDB', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        nome: 'Treino de Força Iniciante',
        nivel: 'iniciante',
        dias: [
          {
            dia_semana: 'Segunda',
            exercicios: [
              { nome: 'Flexão', series: 3, repeticoes: 10 },
              { nome: 'Barra', series: 3, repeticoes: 5 }
            ]
          }
        ]
      })
    })

    render(<App />)

    // Wait for level select step
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Iniciante$/i })).toBeInTheDocument()
    })

    // Click Iniciante
    fireEvent.click(screen.getByRole('button', { name: /^Iniciante$/i }))

    // Wait for days step
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^3 dias$/i })).toBeInTheDocument()
    })

    // Click 3 dias
    fireEvent.click(screen.getByRole('button', { name: /^3 dias$/i }))

    // Wait for goal step
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Força$/i })).toBeInTheDocument()
    })

    // Click Força
    fireEvent.click(screen.getByRole('button', { name: /^Força$/i }))

    // Wait for Gemini mock plan generated and confirmation step
    await waitFor(() => {
      expect(screen.getByText(/Sugestão de Plano: Treino de Força Iniciante/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Confirmar Plano$/i })).toBeInTheDocument()
    })

    // Confirm
    fireEvent.click(screen.getByRole('button', { name: /^Confirmar Plano$/i }))

    // Verify success message and database save
    await waitFor(() => {
      expect(screen.getByText(/Plano salvo com sucesso!/i)).toBeInTheDocument()
    })

    const planos = await db.plano_ativo.toArray()
    expect(planos).toHaveLength(1)
    expect(planos[0].nome).toBe('Treino de Força Iniciante')
    expect(planos[0].nivel).toBe('iniciante')
    expect(planos[0].dias).toHaveLength(1)
    expect(planos[0].dias[0].dia_semana).toBe('Segunda')
    expect(planos[0].dias[0].exercicios[0].nome).toBe('Flexão')
  })

  it('displays active plan when command ver meu plano is sent', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    // Seed db with plan
    await db.plano_ativo.add({
      nome: 'Meu Plano de Teste',
      nivel: 'avancado',
      criado_em: new Date().toISOString(),
      dias: [
        {
          dia_semana: 'Quarta',
          exercicios: [{ nome: 'Muscle Up', series: 4, repeticoes: 6 }]
        }
      ]
    })

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'ver meu plano' } })
    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    await waitFor(() => {
      expect(screen.getByText(/Seu Plano Ativo: Meu Plano de Teste/i)).toBeInTheDocument()
      expect(screen.getByText(/Quarta/i)).toBeInTheDocument()
      expect(screen.getByText(/Muscle Up: 4x6/i)).toBeInTheDocument()
    })
  })

  it('confirms plan replacement when creating a new plan over an active one', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    // Seed initial plan
    await db.plano_ativo.add({
      nome: 'Plano Antigo',
      nivel: 'iniciante',
      criado_em: new Date().toISOString(),
      dias: []
    })

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'criar plano' } })
    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    await waitFor(() => {
      expect(screen.getByText(/Você já possui um plano ativo. Deseja substituí-lo por um novo\?/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Sim, substituir$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Não$/i })).toBeInTheDocument()
    })

    // Click Sim, substituir
    fireEvent.click(screen.getByRole('button', { name: /^Sim, substituir$/i }))

    await waitFor(() => {
      expect(screen.getByText(/Escolha o seu nível de experiência na calistenia:/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Iniciante$/i })).toBeInTheDocument()
    })
  })

  it('renders history modal with seeded data when clicking calendar button', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    // Seed db with past workouts
    await db.historico_treinos.add({
      data: '2026-06-25',
      hora_inicio: '18:00',
      exercicios_realizados: [
        { nome: 'Flexão', series: 3, repeticoes: 10, observacao: 'Diamante' }
      ]
    })
    await db.historico_treinos.add({
      data: '2026-06-24',
      hora_inicio: '10:00',
      exercicios_realizados: [
        { nome: 'Barra', series: 4, repeticoes: 8, observacao: '' }
      ]
    })

    render(<App />)

    // Click history calendar button
    const historyBtn = screen.getByLabelText('Abrir histórico de treinos')
    fireEvent.click(historyBtn)

    // Verify history modal title and contents
    await waitFor(() => {
      expect(screen.getByText('Histórico de Treinos 📅')).toBeInTheDocument()
      expect(screen.getByText('25/06/2026')).toBeInTheDocument()
      expect(screen.getByText(/Iniciou às 18:00/i)).toBeInTheDocument()
      expect(screen.getByText(/Flexão/i)).toBeInTheDocument()
      expect(screen.getByText(/3 séries de 10 reps/i)).toBeInTheDocument()
      expect(screen.getByText(/\(Diamante\)/i)).toBeInTheDocument()

      expect(screen.getByText('24/06/2026')).toBeInTheDocument()
      expect(screen.getByText(/Iniciou às 10:00/i)).toBeInTheDocument()
      expect(screen.getByText(/Barra/i)).toBeInTheDocument()
      expect(screen.getByText(/4 séries de 8 reps/i)).toBeInTheDocument()
    })

    // Click close button inside modal
    const closeBtn = screen.getByRole('button', { name: /^Fechar$/i })
    fireEvent.click(closeBtn)

    await waitFor(() => {
      expect(screen.queryByText('Histórico de Treinos 📅')).not.toBeInTheDocument()
    })
  })

  it('opens history modal when sending ver histórico command and shows todays workouts', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    const todayStr = new Date().toISOString().split('T')[0]
    await db.historico_treinos.add({
      data: todayStr,
      hora_inicio: '08:30',
      exercicios_realizados: [
        { nome: 'Dip', series: 3, repeticoes: 12, observacao: 'Paralelas' }
      ]
    })

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'ver histórico' } })
    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    // Verify chat reply
    await waitFor(() => {
      expect(screen.getByText('Abrindo o seu histórico de treinos... 📅')).toBeInTheDocument()
    })

    // Verify modal is open and displays today's workout
    await waitFor(() => {
      expect(screen.getByText('Histórico de Treinos 📅')).toBeInTheDocument()
      expect(screen.getByText(/Iniciou às 08:30/i)).toBeInTheDocument()
      expect(screen.getByText(/Dip/i)).toBeInTheDocument()
      expect(screen.getByText(/3 séries de 12 reps/i)).toBeInTheDocument()
      expect(screen.getByText(/\(Paralelas\)/i)).toBeInTheDocument()
    })
  })

  it('displays retry button on Gemini failure, and successfully retries when clicked', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    // First call fails with an API error
    generateContentMock.mockRejectedValueOnce(new Error('API key not valid'))

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'fiz 3x10 flexões' } })
    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    // Wait for the failure message bubble and verify retry button is present
    let retryBtn: HTMLElement | null = null
    await waitFor(() => {
      expect(screen.getByText(/Erro ao se comunicar com a API do Gemini/i)).toBeInTheDocument()
      retryBtn = screen.getByRole('button', { name: /Tentar Novamente/i })
      expect(retryBtn).toBeInTheDocument()
    })

    // Mock next call as successful
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        isWorkout: true,
        isCalisthenics: true,
        exercicios: [
          { nome: 'Flexão', series: 3, repeticoes: 10, observacao: '' }
        ]
      })
    })

    // Click retry
    fireEvent.click(retryBtn!)

    // Verify it succeeded on retry and shows confirmation options
    await waitFor(() => {
      expect(screen.getByText(/Entendi o seguinte treino:/i)).toBeInTheDocument()
      expect(screen.getByText(/Flexão: 3 série\(s\) de 10 repetição\(ões\)/i)).toBeInTheDocument()
      // Old error message should be removed
      expect(screen.queryByText(/Erro ao se comunicar com a API do Gemini/i)).not.toBeInTheDocument()
    })
  })
})
