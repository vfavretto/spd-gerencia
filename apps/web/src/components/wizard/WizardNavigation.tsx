import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import clsx from 'clsx';

type WizardNavigationProps = {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  canProceed?: boolean;
};

export function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  canProceed = true
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep}
        className={clsx(
          'inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition',
          isFirstStep
            ? 'cursor-not-allowed text-slate-300'
            : 'text-slate-600 hover:bg-slate-100'
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">
          Passo {currentStep + 1} de {totalSteps}
        </span>

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !canProceed}
            className={clsx(
              'inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition',
              isSubmitting || !canProceed
                ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            )}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Finalizar
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={clsx(
              'inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition',
              !canProceed
                ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                : 'bg-primary-600 text-white hover:bg-primary-500'
            )}
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

