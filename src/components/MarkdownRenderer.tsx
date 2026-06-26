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
    // Regex para identificar **bold**, *italic*, `code`
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

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Títulos de nível 3
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${lineIndex}`} className="markdown-h3">
          {parseInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
    }
    // Títulos de nível 2
    else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${lineIndex}`} className="markdown-h2">
          {parseInlineMarkdown(trimmed.slice(3))}
        </h3>
      );
    }
    // Títulos de nível 1
    else if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h1-${lineIndex}`} className="markdown-h1">
          {parseInlineMarkdown(trimmed.slice(2))}
        </h2>
      );
    }
    // Listas não-ordenadas
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(
        <li key={`li-${lineIndex}`} className="markdown-li">
          {parseInlineMarkdown(trimmed.slice(2))}
        </li>
      );
    }
    // Linha em branco ou vazia
    else if (trimmed === '') {
      flushList();
      elements.push(<div key={`space-${lineIndex}`} className="markdown-spacer" />);
    }
    // Parágrafo comum
    else {
      flushList();
      elements.push(
        <p key={`p-${lineIndex}`} className="markdown-p">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  });

  // Garante o fechamento de qualquer lista pendente no final do texto
  flushList();

  return <div className="markdown-container">{elements}</div>;
};
