import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';
import type { ConvenioStatus } from '@/modules/shared/types';

const statusExpectations: {
  status: ConvenioStatus;
  label: string;
  bgClass: string;
  textClass: string;
}[] = [
  { status: 'RASCUNHO', label: 'Rascunho', bgClass: 'bg-slate-100', textClass: 'text-slate-600' },
  { status: 'EM_ANALISE', label: 'Em análise', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
  { status: 'APROVADO', label: 'Aprovado', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
  { status: 'EM_EXECUCAO', label: 'Em execução', bgClass: 'bg-indigo-100', textClass: 'text-indigo-700' },
  { status: 'CONCLUIDO', label: 'Concluído', bgClass: 'bg-green-100', textClass: 'text-green-700' },
  { status: 'CANCELADO', label: 'Cancelado', bgClass: 'bg-rose-100', textClass: 'text-rose-700' },
];

describe('StatusBadge', () => {
  it.each(statusExpectations)(
    'renderiza label e estilo corretos para $status',
    ({ status, label, bgClass, textClass }) => {
      render(<StatusBadge status={status} />);

      const badge = screen.getByText(label);

      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(bgClass);
      expect(badge).toHaveClass(textClass);
      expect(badge).toHaveClass('rounded-full');
    },
  );
});
