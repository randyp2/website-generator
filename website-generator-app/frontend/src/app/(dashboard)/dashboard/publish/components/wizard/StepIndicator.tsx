"use client"

import {
  StepProgressItem,
  type WizardStepState,
} from "./StepProgressItem"

export interface WizardStepDef {
  key: string
  label: string
}

interface StepIndicatorProps {
  steps: WizardStepDef[]
  currentStep: number
  onJumpTo?: (step: number) => void
}

const resolveStepState = (
  stepIndex: number,
  currentStep: number,
): WizardStepState => {
  if (stepIndex < currentStep) return "completed"
  if (stepIndex === currentStep) return "active"
  return "inactive"
}

export const StepIndicator = ({ steps, currentStep, onJumpTo }: StepIndicatorProps) => {
  return (
    <ol className="flex w-full items-start gap-3.5">
      {steps.map((step, index) => {
        const state = resolveStepState(index, currentStep)
        const isClickable = state === "completed" && Boolean(onJumpTo)

        return (
          <li key={step.key} className="min-w-0 flex-1">
            <StepProgressItem
              index={index}
              label={step.label}
              state={state}
              isClickable={isClickable}
              onSelect={onJumpTo}
            />
          </li>
        )
      })}
    </ol>
  )
}
