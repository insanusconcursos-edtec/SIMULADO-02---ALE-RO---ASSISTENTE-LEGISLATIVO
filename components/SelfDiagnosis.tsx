
import React, { useState, useMemo } from 'react';
import { Submission, AnswerOption, QuestionMetadata, DiagnosisReason } from '../types';
import { DISCIPLINES } from '../constants';

interface SelfDiagnosisProps {
  submission: Submission;
  adminAnswers: Record<number, AnswerOption>;
  questionMetadata: Record<number, QuestionMetadata>;
  editalTopics: Record<string, string[]>;
  onSaveDiagnosis: (diagnosis: Record<number, DiagnosisReason>) => void;
}

const SelfDiagnosis: React.FC<SelfDiagnosisProps> = ({ 
  submission, 
  adminAnswers, 
  questionMetadata, 
  onSaveDiagnosis 
}) => {
  const [activeDisciplineIndex, setActiveDisciplineIndex] = useState(0);
  const [localDiagnosis, setLocalDiagnosis] = useState<Record<number, DiagnosisReason>>(submission.selfDiagnosis || {});
  const [showReport, setShowReport] = useState(false);

  const activeDiscipline = DISCIPLINES[activeDisciplineIndex];

  const questions = useMemo(() => {
    const qs = [];
    for (let i = activeDiscipline.start; i <= activeDiscipline.end; i++) {
        const userAnswer = submission.answers[i];
        const correctAnswer = adminAnswers[i];
        const isAnnulled = correctAnswer === 'X';
        const isCorrect = (isAnnulled && userAnswer) || userAnswer === correctAnswer;
        qs.push({
            number: i,
            isCorrect,
            userAnswer,
            correctAnswer,
            metadata: questionMetadata[i] || { theme: 'Não cadastrado', topics: [] }
        });
    }
    return qs;
  }, [activeDiscipline, submission.answers, adminAnswers, questionMetadata]);

  const handleReasonChange = (qNumber: number, reason: DiagnosisReason) => {
    const newDiagnosis = { ...localDiagnosis, [qNumber]: reason };
    setLocalDiagnosis(newDiagnosis);
    setShowReport(false); // Hide report if data changes
  };

  const handleSaveAndGenerate = () => {
    onSaveDiagnosis(localDiagnosis);
    setShowReport(true);
  };

  // Check if all questions in current discipline have a diagnosis
  const isDisciplineComplete = questions.every(q => !!localDiagnosis[q.number]);

  const diagnosisOptionsCorrect = [
    { value: 'DOMINIO', label: 'Domínio do Assunto' },
    { value: 'CHUTE_CONSCIENTE', label: 'Chute Consciente' },
    { value: 'CHUTE_SORTE', label: 'Chute na Sorte' },
  ];

  const diagnosisOptionsIncorrect = [
    { value: 'FALTA_CONTEUDO', label: 'Falta de Conteúdo' },
    { value: 'FALTA_ATENCAO', label: 'Falta de Atenção' },
  ];

  const renderActionPlan = () => {
    if (!showReport) return null;

    const strongPoints: { theme: string, topics: string[] }[] = [];
    const quickReview: { theme: string, topics: string[] }[] = [];
    const generalReview: { theme: string, topics: string[] }[] = [];
    const studyPriority: { theme: string, topics: string[] }[] = [];

    questions.forEach(q => {
        const reason = localDiagnosis[q.number];
        const meta = q.metadata;
        
        if (!reason) return;

        if (q.isCorrect && reason === 'DOMINIO') {
            strongPoints.push(meta);
        } else if (q.isCorrect && reason === 'CHUTE_CONSCIENTE') {
            quickReview.push(meta);
        } else if (q.isCorrect && reason === 'CHUTE_SORTE') {
            studyPriority.push(meta);
        } else if (!q.isCorrect && reason === 'FALTA_ATENCAO') {
            generalReview.push(meta);
        } else if (!q.isCorrect && reason === 'FALTA_CONTEUDO') {
            studyPriority.push(meta);
        }
    });

    const PlanCard = ({ title, items, colorClass, description, icon }: any) => (
        <div className={`p-4 rounded-lg border-l-4 shadow-sm mb-4 ${colorClass}`}>
            <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{icon}</span>
                <h4 className="font-bold text-lg">{title}</h4>
            </div>
            <p className="text-sm mb-3 italic opacity-90">{description}</p>
            {items.length === 0 ? (
                <p className="text-gray-500 text-sm ml-8">Nenhum tópico identificado para esta categoria.</p>
            ) : (
                <ul className="list-disc list-inside ml-2 space-y-1">
                    {items.map((item: any, idx: number) => (
                        <li key={idx} className="text-sm">
                            <span className="font-semibold">{item.theme}</span>
                            {item.topics.length > 0 && <span className="text-xs block ml-4 text-gray-600">Tópicos: {item.topics.join(', ')}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="mt-8 animate-fade-in">
             <h3 className="text-2xl font-bold text-center text-secondary mb-2">Plano de Ação: {activeDiscipline.name}</h3>
             <p className="text-center text-gray-600 mb-6">Baseado no seu autodiagnóstico desta disciplina.</p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlanCard 
                    title="PONTOS FORTES" 
                    items={strongPoints} 
                    colorClass="bg-green-50 border-green-500 text-green-900"
                    icon="💪"
                    description="Assuntos dominados. Não é necessário estudar no momento."
                />
                <PlanCard 
                    title="REVISÃO RÁPIDA" 
                    items={quickReview} 
                    colorClass="bg-yellow-50 border-yellow-500 text-yellow-900"
                    icon="⚡"
                    description="Chute consciente. Faça uma revisão pontual ou leia o comentário da questão."
                />
                <PlanCard 
                    title="REVISÃO GERAL" 
                    items={generalReview} 
                    colorClass="bg-orange-50 border-orange-500 text-orange-900"
                    icon="🔍"
                    description="Falta de atenção. Releia o resumo/material e faça uma bateria de questões de treino."
                />
                <PlanCard 
                    title="PRIORIDADE DE ESTUDOS" 
                    items={studyPriority} 
                    colorClass="bg-red-50 border-red-500 text-red-900"
                    icon="🚨"
                    description="Falta de conteúdo ou sorte. Estude a teoria (leitura/vídeo) e faça muitos exercícios."
                />
             </div>
        </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border p-4">
        <h2 className="text-2xl font-bold text-secondary mb-6 text-center">Autodiagnóstico e Desempenho</h2>
        
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
            {DISCIPLINES.map((disc, idx) => (
                <button
                    key={idx}
                    onClick={() => { setActiveDisciplineIndex(idx); setShowReport(false); }}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${
                        idx === activeDisciplineIndex 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {disc.name}
                </button>
            ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">{activeDiscipline.name}</h3>
            
            <div className="space-y-4">
                {questions.map(q => {
                    const isSelected = !!localDiagnosis[q.number];
                    return (
                        <div key={q.number} className={`p-4 rounded-lg border ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-700">Questão {q.number}</span>
                                        {q.isCorrect ? (
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-200 text-green-800">ACERTOU</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-200 text-red-800">ERROU</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Tema:</span> {q.metadata.theme}
                                    </p>
                                    {q.metadata.topics.length > 0 && (
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold">Tópicos:</span> {q.metadata.topics.join(', ')}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                        {q.isCorrect ? 'Motivo do Acerto' : 'Motivo do Erro'}
                                    </label>
                                    <select
                                        className={`w-full sm:w-48 p-2 rounded border text-sm focus:ring-2 focus:ring-primary outline-none ${isSelected ? 'bg-white' : 'bg-yellow-50 border-yellow-300'}`}
                                        value={localDiagnosis[q.number] || ''}
                                        onChange={(e) => handleReasonChange(q.number, e.target.value as DiagnosisReason)}
                                    >
                                        <option value="">Selecione...</option>
                                        {(q.isCorrect ? diagnosisOptionsCorrect : diagnosisOptionsIncorrect).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSaveAndGenerate}
                    disabled={!isDisciplineComplete}
                    className="bg-accent text-primary font-bold py-2 px-6 rounded-lg shadow hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Gerar Plano de Ação
                </button>
            </div>
            {!isDisciplineComplete && (
                <p className="text-right text-xs text-red-500 mt-2">Preencha o motivo de todas as questões desta disciplina para gerar o plano.</p>
            )}
        </div>

        {renderActionPlan()}
    </div>
  );
};

export default SelfDiagnosis;
