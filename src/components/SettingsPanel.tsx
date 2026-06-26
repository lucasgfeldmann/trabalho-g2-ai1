import React, { useState, useEffect } from 'react';
import { db } from '../db/db';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string, customModel: string) => void;
  initialApiKey?: string;
  initialModel?: string;
  initialCustomModel?: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  initialApiKey = '',
  initialModel = 'gemini-3-flash-preview',
  initialCustomModel = '',
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [model, setModel] = useState(initialModel);
  const [customModel, setCustomModel] = useState(initialCustomModel);

  // Sync state if initial props change (e.g., when loaded from localStorage)
  useEffect(() => {
    setApiKey(initialApiKey);
    setModel(initialModel);
    setCustomModel(initialCustomModel);
  }, [initialApiKey, initialModel, initialCustomModel, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(apiKey.trim(), model, customModel.trim());
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    setModel('gemini-3-flash-preview');
    setCustomModel('');
    onSave('', 'gemini-3-flash-preview', '');
  };

  const handleResetApp = async () => {
    const confirmReset = window.confirm(
      'ATENÇÃO PERIGO: Isso apagará permanentemente todo o seu histórico de treinos registrados, planos criados e configurações armazenados localmente neste navegador. Esta ação NÃO pode ser desfeita. Deseja continuar?'
    );
    if (confirmReset) {
      try {
        localStorage.clear();
        await db.delete();
        window.location.reload();
      } catch (err) {
        console.error('Erro ao deletar banco de dados:', err);
        alert('Ocorreu um erro ao resetar a aplicação local. Tente limpar os dados de cookies/banco do navegador manualmente.');
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="settings-title">Configurações do Gemini</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar modal">
            &times;
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="apiKey">Gemini API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua API Key da Google AI Studio aqui..."
              className="text-input"
            />
            <small className="help-text">
              Sua chave é armazenada localmente de forma segura no seu próprio navegador.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="model-select">Modelo de IA</label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="select-input"
            >
              <option value="gemini-3-flash-preview">gemini-3-flash-preview (Padrão / Recomendado)</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
              <option value="gemini-flash-lite-latest">gemini-flash-lite-latest</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              <option value="custom">Outro / Customizado</option>
            </select>
          </div>

          {model === 'custom' && (
            <div className="form-group">
              <label htmlFor="custom-model">Nome do Modelo Customizado</label>
              <input
                type="text"
                id="custom-model"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Ex: gemini-2.0-flash-exp"
                className="text-input"
                required={model === 'custom'}
              />
            </div>
          )}

          <div className="modal-actions" style={{ marginBottom: '16px' }}>
            <button type="button" className="secondary-btn" onClick={handleClear}>
              Limpar Tudo
            </button>
            <div className="right-actions">
              <button type="button" className="tertiary-btn" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="primary-btn">
                Salvar
              </button>
            </div>
          </div>

          <div className="danger-zone-settings" style={{ borderTop: '1px solid rgba(239, 68, 68, 0.2)', paddingTop: '16px', marginTop: '8px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontStyle: 'italic' }}>
              Ação irreversível: apaga todas as chaves, históricos e bancos locais do navegador.
            </p>
            <button
              type="button"
              className="danger-btn reset-app-btn"
              onClick={handleResetApp}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ⚠️ Reset Completo da Aplicação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
