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
      expect(screen.getByText(/Treino registrado com sucesso no histórico do dia/i)).toBeInTheDocument()
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
        activeTab="chat"
        setActiveTab={vi.fn()}
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

    await waitFor(() => {
      expect(screen.getByText('Histórico de Treinos 📅')).toBeInTheDocument()
      expect(screen.getByText(/25\/06\/2026 às 18:00/i)).toBeInTheDocument()
      expect(screen.getByText(/Flexão/i)).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('Diamante')).toBeInTheDocument()

      expect(screen.getByText(/24\/06\/2026 às 10:00/i)).toBeInTheDocument()
      expect(screen.getByText(/Barra/i)).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
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

    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    const formattedToday = `${day}/${month}/${year}`

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'ver histórico' } })
    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    // Verify modal is open and displays today's workout
    await waitFor(() => {
      expect(screen.getByText('Histórico de Treinos 📅')).toBeInTheDocument()
      expect(screen.getByText(/Dip/i)).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('Paralelas')).toBeInTheDocument()
      expect(screen.getByText(new RegExp(`${formattedToday} às 08:30`, 'i'))).toBeInTheDocument()
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

  it('prompts user to save when Gemini returns create_plan action, and saves to IndexedDB upon confirmation', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    const mockPlan = {
      nome: 'Plano IA Força',
      nivel: 'iniciante',
      dias: [
        {
          dia_semana: 'Segunda',
          exercicios: [{ nome: 'Flexão', series: 3, repeticoes: 10 }]
        }
      ]
    }

    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        isWorkout: false,
        isCalisthenics: true,
        respostaConversacional: 'Aqui está sua nova rotina.',
        action: 'create_plan',
        planoGeral: mockPlan
      })
    })

    render(<App />)

    // Send command to create plan
    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'crie um plano de força' } })
    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    // Verify confirmation message and details
    await waitFor(() => {
      expect(screen.getByText(/Aqui está sua nova rotina/i)).toBeInTheDocument()
      expect(screen.getByText(/Plano Sugerido: Plano IA Força/i)).toBeInTheDocument()
      expect(screen.getByText(/Deseja salvar este novo plano como seu plano ativo\?/i)).toBeInTheDocument()
    })

    // Click quick option 'Confirmar Plano'
    const confirmBtn = screen.getByRole('button', { name: 'Confirmar Plano' })
    fireEvent.click(confirmBtn)

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Plano salvo com sucesso! Agora ele é o seu plano ativo/i)).toBeInTheDocument()
    })

    // Verify DB contains it
    const plansInDb = await db.plano_ativo.toArray()
    expect(plansInDb.length).toBe(1)
    expect(plansInDb[0].nome).toBe('Plano IA Força')
  })

  it('prompts user to save when Gemini returns edit_plan action, and updates IndexedDB upon confirmation', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    // Initial plan in DB
    await db.plano_ativo.add({
      nome: 'Plano Antigo',
      nivel: 'iniciante',
      criado_em: new Date().toISOString(),
      dias: [
        {
          dia_semana: 'Segunda',
          exercicios: [{ nome: 'Flexão', series: 3, repeticoes: 10 }]
        }
      ]
    })

    const mockUpdatedPlan = {
      nome: 'Plano Atualizado',
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
    }

    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        isWorkout: false,
        isCalisthenics: true,
        respostaConversacional: 'Adicionei barra na segunda.',
        action: 'edit_plan',
        planoGeral: mockUpdatedPlan
      })
    })

    render(<App />)

    // Send edit command
    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'adicione barra na segunda' } })
    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    // Verify confirmation message
    await waitFor(() => {
      expect(screen.getByText(/Adicionei barra na segunda/i)).toBeInTheDocument()
      expect(screen.getByText(/Plano Sugerido: Plano Atualizado/i)).toBeInTheDocument()
      expect(screen.getByText(/Deseja salvar estas alterações no seu plano ativo\?/i)).toBeInTheDocument()
    })

    // Click quick option 'Confirmar Plano'
    const confirmBtn = screen.getByRole('button', { name: 'Confirmar Plano' })
    fireEvent.click(confirmBtn)

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Plano atualizado com sucesso no banco de dados local/i)).toBeInTheDocument()
    })

    // Verify DB contains it
    const plansInDb = await db.plano_ativo.toArray()
    expect(plansInDb.length).toBe(1)
    expect(plansInDb[0].nome).toBe('Plano Atualizado')
  })

  it('navigates through bottom tabs', async () => {
    render(<App />)

    // Initially on Chat tab
    expect(screen.getByPlaceholderText(/Configure a API Key para conversar/i)).toBeInTheDocument()

    // Click Histórico tab
    const historyTabBtn = screen.getByLabelText('Aba Histórico')
    fireEvent.click(historyTabBtn)

    await waitFor(() => {
      expect(screen.getByText('Histórico de Treinos 📅')).toBeInTheDocument()
    })

    // Click Plano tab
    const planTabBtn = screen.getByLabelText('Aba Plano')
    fireEvent.click(planTabBtn)

    await waitFor(() => {
      expect(screen.getByText(/Nenhum plano ativo/i)).toBeInTheDocument()
    })

    // Click Chat tab
    const chatTabBtn = screen.getByLabelText('Aba Conversa')
    fireEvent.click(chatTabBtn)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Configure a API Key para conversar/i)).toBeInTheDocument()
    })
  })

  it('renders active plan in Plano tab', async () => {
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaSemanaHoje = diasSemana[new Date().getDay()];

    // Seed active plan
    await db.plano_ativo.add({
      nome: 'Plano Teste',
      nivel: 'iniciante',
      criado_em: new Date().toISOString(),
      dias: [
        {
          dia_semana: diaSemanaHoje,
          exercicios: [
            { nome: 'Flexão', series: 3, repeticoes: 10 }
          ]
        }
      ]
    })

    render(<App />)

    // Navigate to Plano tab
    fireEvent.click(screen.getByLabelText('Aba Plano'))

    await waitFor(() => {
      expect(screen.getByText('📋 Plano Teste')).toBeInTheDocument()
      expect(screen.getByText('Flexão')).toBeInTheDocument()
      expect(screen.getByText('3 séries x 10 reps')).toBeInTheDocument()
    })
  })

  it('filters history by date picker and clears filter with Ver Todos button', async () => {
    // Seed database with workouts from different days
    const todayStr = new Date().toISOString().split('T')[0]
    const otherDateStr = '2026-06-15'

    await db.historico_treinos.add({
      data: todayStr,
      hora_inicio: '08:00',
      exercicios_realizados: [
        { nome: 'Agachamento', series: 3, repeticoes: 15, observacao: 'Pistol', hora_realizacao: '08:00' }
      ]
    })

    await db.historico_treinos.add({
      data: otherDateStr,
      hora_inicio: '18:00',
      exercicios_realizados: [
        { nome: 'Prancha', series: 3, repeticoes: 60, observacao: 'Isometria', hora_realizacao: '18:15' }
      ]
    })

    render(<App />)

    // Go to Histórico tab
    fireEvent.click(screen.getByLabelText('Aba Histórico'))

    // Expect only today's workout to be displayed in production behavior (or all if in test environment setting)
    // Wait, since filterDate state is initialized to todayStr in production, it will only show today's Agachamento.
    // In our HistoryPanel code, we defaulted to todayStr in production, but let's test the date filtering explicitly.
    await waitFor(() => {
      expect(screen.getByText('Agachamento')).toBeInTheDocument()
    })

    // Filter by other date
    const dateInput = screen.getByLabelText(/Filtrar por data/i)
    fireEvent.change(dateInput, { target: { value: otherDateStr } })

    await waitFor(() => {
      expect(screen.queryByText('Agachamento')).not.toBeInTheDocument()
      expect(screen.getByText('Prancha')).toBeInTheDocument()
    })

    // Clear filter
    const clearBtn = screen.getByRole('button', { name: 'Ver Todos' })
    fireEvent.click(clearBtn)

    await waitFor(() => {
      expect(screen.getByText('Agachamento')).toBeInTheDocument()
      expect(screen.getByText('Prancha')).toBeInTheDocument()
    })
  })

  it('exports all history to CSV and triggers download', async () => {
    // Mock URL and createElement for download triggers
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = vi.fn(() => 'blob:test-url')
    URL.revokeObjectURL = vi.fn()

    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    await db.historico_treinos.add({
      data: '2026-06-20',
      hora_inicio: '09:00',
      exercicios_realizados: [
        { nome: 'Flexão', series: 3, repeticoes: 12, observacao: 'Archer', hora_realizacao: '09:00' }
      ]
    })

    render(<App />)

    // Go to Histórico tab
    fireEvent.click(screen.getByLabelText('Aba Histórico'))

    // Find export button
    const exportBtn = screen.getByRole('button', { name: /Exportar CSV/i })
    fireEvent.click(exportBtn)

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
    })

    // Restore URL mocks
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('imports workout logs from CSV file and saves them to database', async () => {
    render(<App />)

    // Go to Histórico tab
    fireEvent.click(screen.getByLabelText('Aba Histórico'))

    const csvContent = `Data,Hora,Exercício,Séries,Repetições,Observações
2026-06-18,10:30,Flexão Diamante,3,8,Mãos juntas
2026-06-18,10:45,Dip,3,10,Paralelas`

    const file = new File([csvContent], 'historico.csv', { type: 'text/csv' })

    const fileInput = screen.getByText(/Importar CSV/i).querySelector('input') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()

    // Mock file input change
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Wait for the import success banner
    await waitFor(async () => {
      expect(screen.getByText(/Importado com sucesso/i)).toBeInTheDocument()
    })

    // Verify DB has the imported logs
    const logs = await db.historico_treinos.where('data').equals('2026-06-18').first()
    expect(logs).toBeDefined()
    expect(logs?.exercicios_realizados).toHaveLength(2)
    expect(logs?.exercicios_realizados[0].nome).toBe('Flexão Diamante')
    expect(logs?.exercicios_realizados[0].series).toBe(3)
    expect(logs?.exercicios_realizados[0].repeticoes).toBe(8)
    expect(logs?.exercicios_realizados[0].observacao).toBe('Mãos juntas')
    expect(logs?.exercicios_realizados[0].hora_realizacao).toBe('10:30')
  })

  it('alternates between table and cards view modes in history tab', async () => {
    // Add workout data to db
    await db.historico_treinos.add({
      data: '2026-06-25',
      hora_inicio: '14:00',
      exercicios_realizados: [
        { nome: 'Barra Fixa', series: 4, repeticoes: 10, observacao: 'Pronada limpa', hora_realizacao: '14:05' }
      ]
    })

    render(<App />)

    // Go to Histórico tab
    fireEvent.click(screen.getByLabelText('Aba Histórico'))

    // Wait for the workout data to load and render
    await waitFor(() => {
      expect(screen.getByText('Barra Fixa')).toBeInTheDocument()
    })

    // Verify toggle buttons are present
    const tableBtn = screen.getByRole('button', { name: /Tabela/i })
    const cardsBtn = screen.getByRole('button', { name: /Cards/i })

    expect(tableBtn).toBeInTheDocument()
    expect(cardsBtn).toBeInTheDocument()

    // 1. By default, it should be in Table view
    expect(tableBtn).toHaveClass('active')
    expect(cardsBtn).not.toHaveClass('active')

    // In table view, elements are rendered in standard cells
    const cells = screen.getAllByRole('cell')
    expect(cells.some(cell => cell.textContent?.includes('Barra Fixa'))).toBe(true)
    expect(cells.some(cell => cell.textContent?.includes('Pronada limpa'))).toBe(true)

    // 2. Click "Cards (Celular)" button
    fireEvent.click(cardsBtn)

    expect(cardsBtn).toHaveClass('active')
    expect(tableBtn).not.toHaveClass('active')

    // In card view, the elements should be present but table structure is gone (or cells list is empty)
    await waitFor(() => {
      expect(screen.queryAllByRole('cell')).toHaveLength(0)
      // Check card contents
      expect(screen.getByText('Barra Fixa')).toBeInTheDocument()
      expect(screen.getByText(/Pronada limpa/i)).toBeInTheDocument()
      expect(screen.getByText(/Séries:/i)).toBeInTheDocument()
      expect(screen.getByText(/Repetições:/i)).toBeInTheDocument()
    })

    // 3. Click "Tabela" button to switch back
    fireEvent.click(tableBtn)

    expect(tableBtn).toHaveClass('active')
    expect(cardsBtn).not.toHaveClass('active')

    await waitFor(() => {
      expect(screen.getAllByRole('cell').length).toBeGreaterThan(0)
    })
  })

  it('parses workout with a specific date and saves to that date in IndexedDB', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    // Mock Gemini response returning a specific date (yesterday)
    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        isWorkout: true,
        isCalisthenics: true,
        data: '2026-06-25',
        exercicios: [
          { nome: 'Agachamento', series: 3, repeticoes: 15, observacao: '' }
        ]
      })
    })

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'ontem fiz 3x15 agachamentos' } })

    const sendBtn = screen.getByLabelText('Enviar mensagem')
    fireEvent.click(sendBtn)

    // Wait for the confirmation to show the specific date label
    await waitFor(() => {
      expect(screen.getByText(/Entendi o seguinte treino \(para o dia 25\/06\/2026\):/i)).toBeInTheDocument()
    })

    // Click Confirm
    const confirmBtn = screen.getByRole('button', { name: /^Confirmar$/i })
    fireEvent.click(confirmBtn)

    // Wait for success message confirming the target date
    await waitFor(() => {
      expect(screen.getByText(/Treino registrado com sucesso no histórico do dia 25\/06\/2026!/i)).toBeInTheDocument()
    })

    // Check IndexedDB
    const savedWorkout = await db.historico_treinos.where('data').equals('2026-06-25').first()
    expect(savedWorkout).toBeDefined()
    expect(savedWorkout?.exercicios_realizados[0].nome).toBe('Agachamento')
  })

  it('allows the user to correct a workout before confirming', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    // 1. Initial mock response (incorrect series count)
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        isWorkout: true,
        isCalisthenics: true,
        exercicios: [
          { nome: 'Flexão', series: 3, repeticoes: 10, observacao: '' }
        ]
      })
    })

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'fiz 4x10 flexões' } })

    const sendBtn = screen.getByLabelText('Enviar mensagem')
    fireEvent.click(sendBtn)

    // Wait for initial confirmation
    await waitFor(() => {
      expect(screen.getByText(/Flexão: 3 série\(s\) de 10 repetição\(ões\)/i)).toBeInTheDocument()
    })

    // 2. Click "Corrigir" quick action button
    const correctBtn = screen.getByRole('button', { name: /^Corrigir$/i })
    fireEvent.click(correctBtn)

    // Wait for instruction message
    await waitFor(() => {
      expect(screen.getByText(/Por favor, digite a correção que deseja fazer/i)).toBeInTheDocument()
    })

    // 3. Mock correction response
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        isWorkout: true,
        isCalisthenics: true,
        exercicios: [
          { nome: 'Flexão', series: 4, repeticoes: 10, observacao: '' }
        ]
      })
    })

    // Type the correction
    fireEvent.change(input, { target: { value: 'mude para 4 séries' } })
    fireEvent.click(sendBtn)

    // Wait for corrected confirmation
    await waitFor(() => {
      expect(screen.getByText(/Flexão: 4 série\(s\) de 10 repetição\(ões\)/i)).toBeInTheDocument()
    })

    // 4. Click Confirm
    const confirmBtn = screen.getByRole('button', { name: /^Confirmar$/i })
    fireEvent.click(confirmBtn)

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Treino registrado com sucesso no histórico/i)).toBeInTheDocument()
    })

    // Check IndexedDB
    const today = new Date().toISOString().split('T')[0]
    const savedWorkout = await db.historico_treinos.where('data').equals(today).first()
    expect(savedWorkout).toBeDefined()
    expect(savedWorkout?.exercicios_realizados[0].series).toBe(4)
  })
})

