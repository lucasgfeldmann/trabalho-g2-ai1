import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  if (!text) return null;

  // Normaliza finais de linha
  const normalizedText = text.replace(/\r\n/g, '\n');
  const lines = normalizedText.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listKey = 0;

  // Função auxiliar para interpretar Markdown inline (**negrito**, *itálico*, `código`)
  const parseInlineMarkdown = (lineText: string): React.ReactNode[] => {
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const splitParts = lineText.split(regex);

    return splitParts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="markdown-inline-code">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="markdown-list">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Parser de Tabela Markdown
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      flushList(); // Garante o fechamento de listas antes de tabelas
      const tableLines: string[] = [];
      
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length > 0) {
        const parsedRows = tableLines.map(tLine => {
          const parts = tLine.split('|').map(p => p.trim());
          if (parts[0] === '') parts.shift();
          if (parts[parts.length - 1] === '') parts.pop();
          return parts;
        });

        const headerRow = parsedRows[0];
        const bodyRows: string[][] = [];

        for (let rIdx = 1; rIdx < parsedRows.length; rIdx++) {
          const row = parsedRows[rIdx];
          const isSeparator = row.every(cell => /^[:-]+$/.test(cell) || cell === '');
          if (!isSeparator) {
            bodyRows.push(row);
          }
        }

        elements.push(
          <div key={`table-wrapper-${i}`} className="markdown-table-wrapper">
            <table className="markdown-table">
              <thead>
                <tr>
                  {headerRow.map((cell, cIdx) => (
                    <th key={`th-${cIdx}`}>
                      {parseInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={`tr-${rIdx}`}>
                    {row.map((cell, cIdx) => (
                      <td key={`td-${cIdx}`}>
                        {parseInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // 2. Títulos de nível 3
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${i}`} className="markdown-h3">
          {parseInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
    }
    // Títulos de nível 2
    else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${i}`} className="markdown-h2">
          {parseInlineMarkdown(trimmed.slice(3))}
        </h3>
      );
    }
    // Títulos de nível 1
    else if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h1-${i}`} className="markdown-h1">
          {parseInlineMarkdown(trimmed.slice(2))}
        </h2>
      );
    }
    // Listas não-ordenadas
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(
        <li key={`li-${i}`} className="markdown-li">
          {parseInlineMarkdown(trimmed.slice(2))}
        </li>
      );
    }
    // Linha em branco ou vazia
    else if (trimmed === '') {
      flushList();
      elements.push(<div key={`space-${i}`} className="markdown-spacer" />);
    }
    // Parágrafo comum
    else {
      flushList();
      elements.push(
        <p key={`p-${i}`} className="markdown-p">
          {parseInlineMarkdown(line)}
        </p>
      );
    }

    i++;
  }

  // Garante o fechamento de qualquer lista pendente no final do texto
  flushList();

  return <div className="markdown-container">{elements}</div>;
};
