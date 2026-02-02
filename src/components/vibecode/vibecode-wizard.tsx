'use client'

import { useEffect } from 'react'
import { StepIndicator } from './step-indicator'
import { VisionStep } from './steps/vision-step'
import { ContextStep } from './steps/context-step'
import { BlueprintStep } from './steps/blueprint-step'
import { ContractStep } from './steps/contract-step'
import { BuildStep } from './steps/build-step'
import { RefineStep } from './steps/refine-step'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VibeCodeWizardProps {
  projectId: string
  userId: string
}

export function VibeCodeWizard({ projectId, userId }: VibeCodeWizardProps) {
  const router = useRouter()
  const {
    session,
    currentStep,
    isLoading,
    error,
    initSession,
    nextStep,
    prevStep,
    setError,
  } = useVibeCodeStore()

  // Initialize session on mount
  useEffect(() => {
    initSession(projectId, userId)
  }, [projectId, userId, initSession])

  const handleNext = async () => {
    await nextStep()
  }

  const handlePrev = () => {
    prevStep()
  }

  const handleComplete = () => {
    // Navigate back to project hub or show completion
    router.push(`/projects/${projectId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Đã xảy ra lỗi</h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-gray-400">Đang khởi tạo session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="border-b border-white/10 py-4 px-6">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        {currentStep === 1 && <VisionStep onNext={handleNext} />}
        {currentStep === 2 && <ContextStep onNext={handleNext} onPrev={handlePrev} />}
        {currentStep === 3 && <BlueprintStep onNext={handleNext} onPrev={handlePrev} />}
        {currentStep === 4 && <ContractStep onNext={handleNext} onPrev={handlePrev} />}
        {currentStep === 5 && <BuildStep onNext={handleNext} onPrev={handlePrev} />}
        {currentStep === 6 && <RefineStep onPrev={handlePrev} onComplete={handleComplete} />}
      </div>
    </div>
  )
}
