import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Checkin, Dog } from '../types';
import { formatTimeShort, calculateDuration } from './dataService';

export function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function generateReportSummary(checkins: Checkin[]) {
  const total = checkins.length;
  const noEspaco = checkins.filter((c) => !c.hora_saida).length;
  const concluidos = checkins.filter((c) => Boolean(c.hora_saida)).length;
  return { total, noEspaco, concluidos };
}

/**
 * Generates formatted text suitable for copying to clipboard or sending via WhatsApp
 */
export function generateWhatsAppText(
  dateStr: string,
  checkins: Checkin[],
  dogMap: Map<string, Dog>
): string {
  const displayDate = formatDateBR(dateStr);
  const { total, noEspaco, concluidos } = generateReportSummary(checkins);

  let text = `🐾 *RELATÓRIO DE PRESENÇA - PARAÍSO DAS PATAS*\n`;
  text += `📅 *Data:* ${displayDate}\n`;
  text += `🐶 *Total de Cães:* ${total} | 🟢 *No Espaço:* ${noEspaco} | ✅ *Concluídos:* ${concluidos}\n`;
  text += `─────────────────────────\n\n`;

  if (checkins.length === 0) {
    text += `Nenhum registro de presença nesta data.\n`;
  } else {
    checkins.forEach((c, idx) => {
      const dog = c.dog || dogMap.get(c.dog_id);
      const dogName = dog?.nome || 'Cão';
      const tutor = dog?.tutor_nome ? `(${dog.tutor_nome})` : '';
      const entrada = formatTimeShort(c.hora_entrada);
      const saida = c.hora_saida ? formatTimeShort(c.hora_saida) : 'No espaço';
      const dur = calculateDuration(c.hora_entrada, c.hora_saida);

      text += `${idx + 1}. *${dogName}* ${tutor}\n`;
      text += `   ⏰ ${entrada} ➔ ${saida} (${dur})\n`;
      if (c.observacao_dia) {
        text += `   📝 *Nota:* ${c.observacao_dia}\n`;
      }
      text += `\n`;
    });
  }

  text += `─────────────────────────\n`;
  text += `*Paraíso das Patas - Daycare Canino* 🐕✨`;
  return text;
}

/**
 * Exports checkin records to a CSV file (Excel PT-BR compatible with BOM and semicolon delimiter)
 */
export function exportToCSV(
  dateStr: string,
  checkins: Checkin[],
  dogMap: Map<string, Dog>
): void {
  const displayDate = formatDateBR(dateStr);
  const headers = [
    'Nome do Cão',
    'Tutor',
    'Telefone',
    'Data',
    'Hora Entrada',
    'Hora Saída',
    'Permanência',
    'Status',
    'Observações do Dia',
    'Observações Fixas (Alergias/Cuidados)',
  ];

  const escapeCSV = (val: string | null | undefined): string => {
    if (!val) return '""';
    const clean = String(val).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = checkins.map((c) => {
    const dog = c.dog || dogMap.get(c.dog_id);
    const dogName = dog?.nome || 'Não identificado';
    const tutor = dog?.tutor_nome || '';
    const telefone = dog?.telefone || '';
    const entrada = formatTimeShort(c.hora_entrada);
    const saida = c.hora_saida ? formatTimeShort(c.hora_saida) : 'No espaço';
    const duracao = calculateDuration(c.hora_entrada, c.hora_saida);
    const status = c.hora_saida ? 'Concluído' : 'No espaço';
    const obsDia = c.observacao_dia || '';
    const obsFixa = dog?.observacoes || '';

    return [
      escapeCSV(dogName),
      escapeCSV(tutor),
      escapeCSV(telefone),
      escapeCSV(displayDate),
      escapeCSV(entrada),
      escapeCSV(saida),
      escapeCSV(duracao),
      escapeCSV(status),
      escapeCSV(obsDia),
      escapeCSV(obsFixa),
    ].join(';');
  });

  // UTF-8 Byte Order Mark (\uFEFF) ensures Excel automatically recognizes accented characters
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio-paraiso-das-patas-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data to standard JSON format for audit/backups
 */
export function exportToJSON(
  dateStr: string,
  checkins: Checkin[],
  dogMap: Map<string, Dog>
): void {
  const displayDate = formatDateBR(dateStr);
  const { total, noEspaco, concluidos } = generateReportSummary(checkins);

  const payload = {
    empresa: 'Paraíso das Patas - Daycare Canino',
    dataReferencia: dateStr,
    dataFormatada: displayDate,
    geradoEm: new Date().toISOString(),
    totais: {
      totalRegistros: total,
      noEspaco,
      concluidos,
    },
    registros: checkins.map((c) => {
      const dog = c.dog || dogMap.get(c.dog_id);
      return {
        checkinId: c.id,
        cao: {
          id: dog?.id || c.dog_id,
          nome: dog?.nome || 'Desconhecido',
          tutor: dog?.tutor_nome || '',
          telefone: dog?.telefone || '',
          observacoesFixas: dog?.observacoes || null,
        },
        horaEntrada: c.hora_entrada,
        horaSaida: c.hora_saida,
        permanenciaCalculada: calculateDuration(c.hora_entrada, c.hora_saida),
        status: c.hora_saida ? 'concluido' : 'no_espaco',
        observacaoDia: c.observacao_dia || null,
      };
    }),
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio-presenca-${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a direct high-fidelity PDF file using jsPDF and AutoTable.
 * Works natively on all devices and sandboxed browser environments without requiring popup/print permissions.
 */
export function exportToPDF(
  dateStr: string,
  checkins: Checkin[],
  dogMap: Map<string, Dog>
): void {
  const displayDate = formatDateBR(dateStr);
  const { total, noEspaco, concluidos } = generateReportSummary(checkins);
  const generatedAt = new Date().toLocaleString('pt-BR');

  // Initialize PDF in A4 portrait format (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297
  const margin = 14;

  // 1. Header Banner (Navy #142e53)
  doc.setFillColor(20, 46, 83); // #142e53
  doc.roundedRect(margin, 12, pageWidth - margin * 2, 28, 3, 3, 'F');

  // Yellow accent bar (#fffe42)
  doc.setFillColor(255, 254, 66);
  doc.rect(margin, 38, pageWidth - margin * 2, 2, 'F');

  // Title inside banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PARAÍSO DAS PATAS', margin + 6, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text('Relatório Diário de Presença & Frequência', margin + 6, 29);

  // Metadata right-aligned in header
  doc.setFontSize(8);
  doc.setTextColor(255, 254, 66);
  doc.text(`Data: ${displayDate}`, pageWidth - margin - 6, 22, { align: 'right' });
  doc.setTextColor(203, 213, 225);
  doc.text(`Gerado em: ${generatedAt}`, pageWidth - margin - 6, 28, { align: 'right' });

  // 2. Metrics Cards (Total, No Espaço, Concluídos)
  const cardY = 46;
  const cardHeight = 16;
  const availableWidth = pageWidth - margin * 2;
  const cardGap = 4;
  const cardWidth = (availableWidth - cardGap * 2) / 3;

  // Card 1: Total
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DE CÃES', margin + 4, cardY + 6);
  doc.setFontSize(13);
  doc.setTextColor(20, 46, 83);
  doc.text(String(total), margin + 4, cardY + 13);

  // Card 2: No Espaço (Active)
  const card2X = margin + cardWidth + cardGap;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('NO ESPAÇO', card2X + 4, cardY + 6);
  doc.setFontSize(13);
  doc.setTextColor(21, 128, 61);
  doc.text(String(noEspaco), card2X + 4, cardY + 13);

  // Card 3: Saídas Concluídas
  const card3X = card2X + cardWidth + cardGap;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SAÍDAS CONCLUÍDAS', card3X + 4, cardY + 6);
  doc.setFontSize(13);
  doc.setTextColor(51, 65, 85);
  doc.text(String(concluidos), card3X + 4, cardY + 13);

  // 3. Tabular Data using autoTable
  const tableData = checkins.map((c, index) => {
    const dog = c.dog || dogMap.get(c.dog_id);
    const dogName = dog?.nome || 'Cão';
    const tutor = dog?.tutor_nome || '-';
    const tel = dog?.telefone ? `\nTel: ${dog.telefone}` : '';
    const entrada = formatTimeShort(c.hora_entrada);
    const saida = c.hora_saida ? formatTimeShort(c.hora_saida) : 'No espaço';
    const duracao = calculateDuration(c.hora_entrada, c.hora_saida);
    const status = c.hora_saida ? 'Concluído' : 'No espaço';
    
    // Notes: combine fixed dog notes + daily notes
    let notes = '';
    if (c.observacao_dia) {
      notes += `Hoje: ${c.observacao_dia}`;
    }
    if (dog?.observacoes) {
      notes += notes ? `\nFixo: ${dog.observacoes}` : `Fixo: ${dog.observacoes}`;
    }
    if (!notes) notes = '-';

    return [
      String(index + 1),
      dogName,
      `${tutor}${tel}`,
      `${entrada} -> ${saida}`,
      duracao,
      status,
      notes,
    ];
  });

  autoTable(doc, {
    startY: cardY + cardHeight + 6,
    margin: { left: margin, right: margin, bottom: 18 },
    head: [['#', 'Cão', 'Tutor / Contato', 'Horários', 'Permanência', 'Status', 'Observações']],
    body: tableData.length > 0 ? tableData : [['-', 'Nenhum registro encontrado nesta data.', '', '', '', '', '']],
    theme: 'grid',
    headStyles: {
      fillColor: [20, 46, 83], // #142e53
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 3,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 28, fontStyle: 'bold', textColor: [20, 46, 83] },
      2: { cellWidth: 38 },
      3: { cellWidth: 30, fontStyle: 'bold' },
      4: { cellWidth: 24, fontStyle: 'bold', textColor: [71, 85, 105] },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 'auto' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      // Highlight "No espaço" status in green and "Concluído" in grey
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.raw === 'No espaço') {
          data.cell.styles.textColor = [21, 128, 61];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'Concluído') {
          data.cell.styles.textColor = [100, 116, 139];
        }
      }
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageNumber = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.text(
        'Paraíso das Patas • Daycare Canino • Sistema de Gestão',
        margin,
        pageHeight - 7
      );
      doc.text(
        `Página ${data.pageNumber} de ${pageNumber}`,
        pageWidth - margin,
        pageHeight - 7,
        { align: 'right' }
      );
    },
  });

  // Save the PDF file directly to disk
  doc.save(`relatorio-presenca-${dateStr}.pdf`);
}

/**
 * Optional print preview fallback using browser print dialog
 */
export function printReportPreview(
  dateStr: string,
  checkins: Checkin[],
  dogMap: Map<string, Dog>
): void {
  // Call exportToPDF first as the primary reliable delivery
  exportToPDF(dateStr, checkins, dogMap);
}

// Keep backward compatibility export
export const printOrSaveAsPDF = exportToPDF;

