import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose }) => {
  const treinos = useLiveQuery(async () => {
    const rawTreinos = await db.historico_treinos.orderBy('data').reverse().toArray();
    // Filtrar sessões sem exercícios (caso existam)
    return rawTreinos.filter((t) => t.exercicios_realizados && t.exercicios_realizados.length > 0);
  });

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    try {
      // Evita problemas de timezone adicionando T00:00:00
      const date = new Date(`${dateStr}T00:00:00`);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <div className="modal-content history-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="history-title">Histórico de Treinos 📅</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar histórico">
            &times;
          </button>
        </div>

        <div className="history-body">
          {treinos === undefined ? (
            <p className="loading-text">Carregando histórico...</p>
          ) : treinos.length === 0 ? (
            <div className="empty-history">
              <p>Nenhum treino registrado ainda. 💪</p>
              <p className="empty-hint">Registre seus treinos no chat por voz ou texto!</p>
            </div>
          ) : (
            <div className="history-list">
              {treinos.map((treino) => (
                <div key={treino.id} className="history-card">
                  <div className="history-card-header">
                    <span className="history-card-date">{formatDate(treino.data)}</span>
                    <span className="history-card-time">Iniciou às {treino.hora_inicio}</span>
                  </div>
                  <ul className="history-exercicios-list">
                    {treino.exercicios_realizados.map((ex, index) => (
                      <li key={index} className="history-exercicio-item">
                        <span>💪 {ex.nome}</span>: {ex.series} {ex.series > 1 ? 'séries' : 'série'} de {ex.repeticoes} reps
                        {ex.observacao ? <span className="ex-obs"> ({ex.observacao})</span> : ''}
                        <span className="ex-date"> ({formatDate(treino.data)})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions justify-center">
          <button type="button" className="primary-btn close-history-btn" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
