import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

describe('MarkdownRenderer Component', () => {
  it('should render empty text as null', () => {
    const { container } = render(<MarkdownRenderer text="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render simple paragraphs', () => {
    render(<MarkdownRenderer text="Olá, eu sou o CalisBot." />);
    const p = screen.getByText('Olá, eu sou o CalisBot.');
    expect(p.tagName).toBe('P');
    expect(p).toHaveClass('markdown-p');
  });

  it('should render headers correctly', () => {
    const text = `# Titulo 1\n## Titulo 2\n### Titulo 3`;
    render(<MarkdownRenderer text={text} />);

    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2.textContent).toBe('Titulo 1');
    expect(h2).toHaveClass('markdown-h1');

    const h3 = screen.getByRole('heading', { level: 3 });
    expect(h3.textContent).toBe('Titulo 2');
    expect(h3).toHaveClass('markdown-h2');

    const h4 = screen.getByRole('heading', { level: 4 });
    expect(h4.textContent).toBe('Titulo 3');
    expect(h4).toHaveClass('markdown-h3');
  });

  it('should render bold, italic and inline code', () => {
    const text = 'Esta é uma palavra **negrito**, outra *itálico* e um `código` inline.';
    const { container } = render(<MarkdownRenderer text={text} />);

    expect(screen.getByText('negrito').tagName).toBe('STRONG');
    expect(screen.getByText('itálico').tagName).toBe('EM');
    
    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe('código');
    expect(code).toHaveClass('markdown-inline-code');
  });

  it('should render bullet lists correctly', () => {
    const text = 'Lista de exercícios:\n- Flexão\n- Agachamento\n* Barra';
    render(<MarkdownRenderer text={text} />);

    const list = screen.getByRole('list');
    expect(list).toHaveClass('markdown-list');

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toBe('Flexão');
    expect(items[1].textContent).toBe('Agachamento');
    expect(items[2].textContent).toBe('Barra');
  });

  it('should render spacer for empty lines', () => {
    const text = 'Primeiro parágrafo.\n\nSegundo parágrafo.';
    const { container } = render(<MarkdownRenderer text={text} />);

    const spacer = container.querySelector('.markdown-spacer');
    expect(spacer).toBeInTheDocument();
  });

  it('should render tables correctly', () => {
    const text = `
| Exercício | Séries | Repetições |
|---|---|---|
| Flexão | 3 | 10 |
| Barra | 4 | 8 |
`;
    render(<MarkdownRenderer text={text} />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('markdown-table');

    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(3);
    expect(headers[0].textContent).toBe('Exercício');
    expect(headers[1].textContent).toBe('Séries');
    expect(headers[2].textContent).toBe('Repetições');

    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBe(6);
    expect(cells[0].textContent).toBe('Flexão');
    expect(cells[1].textContent).toBe('3');
    expect(cells[2].textContent).toBe('10');
  });
});
