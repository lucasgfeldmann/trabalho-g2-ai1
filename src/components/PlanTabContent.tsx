import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

interface PlanTabContentProps {
  onSendCommand: (cmd: string) => void;
}

export const PlanTabContent: React.FC<PlanTabContentProps> = ({ onSendCommand }) => {
  const [showFullPlan, setShowFullPlan] = useState(false);

  const planoAtivo = useLiveQuery(async () => {
    const planos = await db.plano_ativo.toArray();
    return planos.length > 0 ? planos[0] : null;
  });

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diaSemanaHoje = diasSemana[new Date().getDay()];

  const renderDayCard = (dia: any) => {
    const isToday = dia.dia_semana.toLowerCase() === diaSemanaHoje.toLowerCase();

    return (
      <div
        key={dia.dia_semana}
        className={`plan-day-card ${isToday ? 'today-highlight' : ''}`}
      >
        <div className="plan-day-card-header">
          <h4>{dia.dia_semana}</h4>
          {isToday && <span className="today-badge">Hoje</span>}
        </div>
        <ul className="plan-exercise-checklist" style={{ paddingLeft: 0, listStyle: 'none' }}>
          {dia.exercicios.map((ex: any, index: number) => {
            return (
              <li key={`${ex.nome}-${index}`} className="plan-exercise-item" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="exercise-info" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="exercise-name" style={{ color: 'var(--text-title)', fontWeight: 500 }}>
                    {ex.nome}
                  </span>
                  <span className="exercise-sets-reps" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {ex.series} séries x {ex.repeticoes} reps
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  if (planoAtivo === undefined) {
    return <p className="loading-text">Carregando plano ativo...</p>;
  }

  if (!planoAtivo) {
    return (
      <div className="empty-plan-tab">
        <div className="empty-hint-card">
          <h3>Nenhum plano ativo 📋</h3>
          <p>Você ainda não possui um plano de treino configurado.</p>
          <button
            type="button"
            className="primary-btn mt-4"
            onClick={() => onSendCommand('criar plano')}
          >
            Criar Meu Plano
          </button>
        </div>
      </div>
    );
  }

  const todayWorkout = planoAtivo.dias.find(
    (dia) => dia.dia_semana.toLowerCase() === diaSemanaHoje.toLowerCase()
  );
  const hasWorkoutToday = !!todayWorkout && todayWorkout.exercicios.length > 0;

  return (
    <div className="plan-tab-container">
      <div className="plan-tab-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ margin: 0 }}>📋 {planoAtivo.nome}</h2>
          <button
            type="button"
            className="secondary-btn toggle-full-plan-btn"
            onClick={() => setShowFullPlan(!showFullPlan)}
            style={{ fontSize: '11px', padding: '6px 10px', height: 'auto', minHeight: 'unset' }}
          >
            {showFullPlan ? '📅 Ver Apenas Hoje' : '📋 Ver Plano Inteiro'}
          </button>
        </div>
        <div className="plan-meta-badges" style={{ marginTop: '8px' }}>
          <span className="badge-level">Nível: {planoAtivo.nivel.toUpperCase()}</span>
          <span className="badge-date">
            Criado em: {new Date(planoAtivo.criado_em).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      <div className="plan-days-list">
        {showFullPlan ? (
          planoAtivo.dias.map((dia) => renderDayCard(dia))
        ) : hasWorkoutToday ? (
          renderDayCard(todayWorkout)
        ) : (
          <div className="rest-day-container" style={{ textAlign: 'center', padding: '30px 20px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>🧘</p>
            <h4 style={{ color: 'var(--accent-color)', margin: '0 0 8px 0', fontSize: '16px' }}>Hoje é seu dia de descanso!</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Aproveite para se recuperar e fazer alongamentos leves. Se quiser ver os treinos dos outros dias, confira o plano completo.
            </p>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowFullPlan(true)}
              style={{ fontSize: '12px', padding: '8px 12px' }}
            >
              Visualizar Plano Semanal Completo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
