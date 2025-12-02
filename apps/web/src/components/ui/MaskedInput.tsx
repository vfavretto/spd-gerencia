import { forwardRef, type InputHTMLAttributes, type ChangeEvent } from 'react';
import clsx from 'clsx';

type MaskType = 'cpf' | 'cnpj' | 'cpf_cnpj' | 'currency' | 'phone' | 'cep' | 'date';

type MaskedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  mask: MaskType;
  onChange?: (value: string, rawValue: string) => void;
  error?: string;
  label?: string;
};

// Funções de máscara
const masks = {
  cpf: (value: string) => {
    return value
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  },

  cnpj: (value: string) => {
    return value
      .replace(/\D/g, '')
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  },

  cpf_cnpj: (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return masks.cpf(value);
    }
    return masks.cnpj(value);
  },

  currency: (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = Number(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  },

  phone: (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  },

  cep: (value: string) => {
    return value
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, '$1-$2');
  },

  date: (value: string) => {
    return value
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2');
  }
};

// Funções para extrair valor bruto
const getRawValue = (value: string, mask: MaskType): string => {
  if (mask === 'currency') {
    const numbers = value.replace(/\D/g, '');
    return (Number(numbers) / 100).toString();
  }
  return value.replace(/\D/g, '');
};

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, error, label, className, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const maskedValue = masks[mask](e.target.value);
      const rawValue = getRawValue(maskedValue, mask);

      // Atualiza o valor do input
      e.target.value = maskedValue;

      onChange?.(maskedValue, rawValue);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="form-label">{label}</label>
        )}
        <input
          ref={ref}
          type="text"
          onChange={handleChange}
          className={clsx(
            'form-input',
            error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-100',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-rose-500">{error}</p>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

// Utilitário para parsear valor de moeda
export function parseCurrency(value: string): number {
  const numbers = value.replace(/\D/g, '');
  return Number(numbers) / 100;
}

// Utilitário para formatar valor para moeda
export function formatCurrencyInput(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

