import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import App from '../App'
import { ChatWindow } from '../components/ChatWindow'

describe('CalisBot App & Components', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
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

  it('sends messages and receives mock bot response when API Key is active', async () => {
    // Set API Key in localStorage first
    localStorage.setItem('gemini_api_key', 'valid-key')

    render(<App />)

    const input = screen.getByPlaceholderText(/Envie uma mensagem ou diga o que treinou.../i)
    fireEvent.change(input, { target: { value: 'fiz 3 séries de 10 flexões' } })

    const sendBtn = screen.getByLabelText('Enviar mensagem')
    fireEvent.click(sendBtn)

    // User message should appear immediately
    expect(screen.getByText('fiz 3 séries de 10 flexões')).toBeInTheDocument()

    // Wait for bot mock response
    await waitFor(() => {
      expect(screen.getByText(/Entendido! Você disse: "fiz 3 séries de 10 flexões"./i)).toBeInTheDocument()
    }, { timeout: 1000 })
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

  it('toggles recording and updates input with voice transcript from mock SpeechRecognition', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key')

    const startMock = vi.fn();
    const stopMock = vi.fn();

    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = 'pt-BR';
      onstart = () => {};
      onresult = (_event: any) => {};
      onerror = (_event: any) => {};
      onend = () => {};

      start = startMock.mockImplementation(() => {
        this.onstart();
        setTimeout(() => {
          this.onresult({
            resultIndex: 0,
            results: [
              {
                isFinal: true,
                0: { transcript: 'fiz 3 séries de 10 flexões diamante' }
              }
            ]
          });
          this.stop();
        }, 50);
      });

      stop = stopMock.mockImplementation(() => {
        this.onend();
      });
      abort = vi.fn();
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;

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
})
