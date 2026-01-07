import { statusColors } from '../../constants';
import type { ConvenioStatus } from '../../types';

type Props = {
  status: ConvenioStatus;
};

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const palette = statusColors[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${palette.bg} ${palette.text}`}
    >
      {palette.label}
    </span>
  );
};
