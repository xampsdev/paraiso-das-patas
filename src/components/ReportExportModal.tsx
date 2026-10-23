import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Share2,
  FileCode,
  Copy,
  Check,
  Download,
  Calendar,
  MessageCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Checkin, Dog } from '../types';
import {
  formatDateBR,
  generateReportSummary,
  exportToCSV,
  exportToPDF,
  generateWhatsAppText,
  exportToJSON
} from '../lib/exportUtils';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  checkins: Checkin[];
  dogs: Dog[];
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  checkins,
  dogs
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'opcoes' | 'preview'>('opcoes');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  if (!isOpen) return null;

  const dogMap = new Map<string, Dog>();
  dogs.forEach((d) => dogMap.set(d.id, d));

  const displayDate = formatDateBR(selectedDate);
  const { total, noEspaco, concluidos } = generateReportSummary(checkins);
  const whatsappText = generateWhatsAppText(selectedDate, checkins, dogMap);

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleExportCSV = () => {
    exportToCSV(selectedDate, checkins, dogMap);
  };

  const handleExportPDF = () => {
    setIsGeneratingPdf(true);
    try {
      exportToPDF(selectedDate, checkins, dogMap);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2500);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportJSON = () => {
    exportToJSON(selectedDate, checkins, dogMap);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#091424] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#1b3356] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#142e53] text-white flex items-center justify-between border-b border-[#1b3356]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fffe42] text-[#142e53] flex items-center justify-center font-black shadow-inner">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Exportar Relatório</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#fffe42]" />
                <span>Referência: {displayDate}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Summary */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#0c1a2d] border-b border-slate-200 dark:border-[#1b3356] grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-white dark:bg-[#12243d] border border-slate-200/60 dark:border-[#1e3a63]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total</span>
            <p className="text-lg font-black text-[#142e53] dark:text-[#fffe42]">{total}</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">No Espaço</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{noEspaco}</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#142640] border border-slate-200/60 dark:border-[#1e3a63]">
            <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Concluídos</span>
            <p className="text-lg font-black text-slate-800 dark:text-slate-200">{concluidos}</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-slate-200 dark:border-[#1b3356] bg-slate-100/70 dark:bg-[#0a1728] p-1">
          <button
            onClick={() => setActiveTab('opcoes')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'opcoes'
                ? 'bg-white dark:bg-[#142e53] text-[#142e53] dark:text-[#fffe42] shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Formatos de Exportação
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-[#142e53] text-[#142e53] dark:text-[#fffe42] shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Visualizar Texto Formatado
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {activeTab === 'opcoes' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: CSV / Excel */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1c31] border border-slate-200 dark:border-[#1b3356] hover:border-emerald-400 dark:hover:border-emerald-600 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        Planilha Excel (.CSV)
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Recomendado para Gestão
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                    Compatível com Excel e Google Planilhas. Inclui colunas com nome, tutor, telefone, horários e observações.
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Planilha CSV</span>
                </button>
              </div>

              {/* Option 2: PDF Document Download */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1c31] border border-slate-200 dark:border-[#1b3356] hover:border-blue-400 dark:hover:border-blue-600 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        Relatório em PDF (.pdf)
                      </h4>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Download Direto
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                    Gera e baixa o arquivo PDF com layout oficial do Paraíso das Patas, métricas e listagem completa dos cães.
                  </p>
                </div>
                <button
                  onClick={handleExportPDF}
                  disabled={isGeneratingPdf}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs ${
                    pdfSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#142e53] dark:bg-[#1a365f] hover:bg-[#0c1d35] text-[#fffe42]'
                  }`}
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando PDF...</span>
                    </>
                  ) : pdfSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>PDF Baixado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Baixar Relatório em PDF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 3: WhatsApp & Text */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1c31] border border-slate-200 dark:border-[#1b3356] hover:border-emerald-400 dark:hover:border-emerald-600 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        WhatsApp / Mensagem
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Rápido e Prático
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                    Texto resumido formatado com emojis, status de cada cão e observações para enviar à equipe ou tutores.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                    title="Abrir no aplicativo do WhatsApp"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handleCopyText}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#12243d] hover:bg-slate-200 dark:hover:bg-[#183152] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                    title="Copiar texto para área de transferência"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Option 4: JSON Backup */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1c31] border border-slate-200 dark:border-[#1b3356] hover:border-indigo-400 dark:hover:border-indigo-600 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        Dados Brutos (.JSON)
                      </h4>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Backup Técnico
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                    Arquivo de dados estruturados com metadados, identificadores únicos e histórico para backup e integrações.
                  </p>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar JSON</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Prévia da mensagem pronta para envio:
                </span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fffe42] text-[#142e53] font-black text-xs hover:bg-yellow-300 transition active:scale-95 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto Completo'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72 border border-slate-800 selection:bg-emerald-500 selection:text-black">
                {whatsappText}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0a1728] border-t border-slate-200 dark:border-[#1b3356] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{checkins.length} registros selecionados para exportação</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#12243d] hover:bg-slate-300 dark:hover:bg-[#183152] text-slate-800 dark:text-slate-200 font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
