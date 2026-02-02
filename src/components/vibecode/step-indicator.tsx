'use client'

import { cn } from '@/lib/utils'
import { VIBECODE_STEPS, type VibeCodeStep } from '@/lib/types/vibecode'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: VibeCodeStep
  onStepClick?: (step: VibeCodeStep) => void
  completedSteps?: VibeCodeStep[]
}

export function StepIndicator({
  currentStep,
  onStepClick,
  completedSteps = []
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
      {VIBECODE_STEPS.map((step, index) => {
        const isActive = step.step === currentStep
        const isCompleted = completedSteps.includes(step.step as VibeCodeStep)
        const isPast = step.step < currentStep

        return (
          <div key={step.step} className="flex items-center flex-1">
            {/* Step circle */}
            <button
              onClick={() => onStepClick?.(step.step as VibeCodeStep)}
              disabled={!onStepClick || step.step > currentStep}
              className={cn(
                'relative flex flex-col items-center group',
                onStepClick && step.step <= currentStep && 'cursor-pointer'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all',
                  isActive && 'bg-cyan-500 text-black ring-4 ring-cyan-500/30',
                  isCompleted && 'bg-green-500 text-white',
                  isPast && !isCompleted && 'bg-white/20 text-white',
                  !isActive && !isCompleted && !isPast && 'bg-white/10 text-gray-500'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <div
                  className={cn(
                    'text-xs font-medium',
                    isActive && 'text-cyan-400',
                    isCompleted && 'text-green-400',
                    !isActive && !isCompleted && 'text-gray-500'
                  )}
                >
                  {step.name}
                </div>
                <div className="text-[10px] text-gray-600 hidden md:block max-w-[80px]">
                  {step.description}
                </div>
              </div>
            </button>

            {/* Connector line */}
            {index < VIBECODE_STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  step.step < currentStep ? 'bg-cyan-500/50' : 'bg-white/10'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
