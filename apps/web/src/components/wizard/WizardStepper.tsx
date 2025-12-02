import { Check } from 'lucide-react';
import clsx from 'clsx';

export type WizardStep = {
  id: string;
  title: string;
  description?: string;
};

type WizardStepperProps = {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
};

export function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  return (
    <nav aria-label="Progresso" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index < currentStep;

          return (
            <li key={step.id} className="relative flex flex-1 items-center">
              {/* Linha de conexão */}
              {index > 0 && (
                <div
                  className={clsx(
                    'absolute left-0 right-1/2 top-5 h-0.5 -translate-y-1/2',
                    isCompleted || isCurrent ? 'bg-primary-500' : 'bg-slate-200'
                  )}
                  style={{ left: '-50%' }}
                />
              )}

              <div
                className={clsx(
                  'relative flex flex-col items-center',
                  isClickable && 'cursor-pointer'
                )}
                onClick={() => isClickable && onStepClick(index)}
              >
                {/* Círculo do step */}
                <div
                  className={clsx(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all',
                    isCompleted
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : isCurrent
                        ? 'border-primary-500 bg-white text-primary-600'
                        : 'border-slate-200 bg-white text-slate-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Título e descrição */}
                <div className="mt-3 text-center">
                  <p
                    className={clsx(
                      'text-sm font-semibold',
                      isCurrent ? 'text-primary-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-slate-500 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Linha de conexão após */}
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'absolute left-1/2 right-0 top-5 h-0.5 -translate-y-1/2',
                    index < currentStep ? 'bg-primary-500' : 'bg-slate-200'
                  )}
                  style={{ right: '-50%' }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

