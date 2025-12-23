import { Check } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function ProgressSteps({
  currentStep,
  totalSteps,
  steps,
}: ProgressStepsProps) {
  const progressPercent =
    totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-full">
      <div className="relative mb-6">
        {/* Track line */}
        <div className="absolute left-0 right-0 z-0 h-1 bg-gray-200 rounded-full top-5" />
        {/* Filled line */}
        <div
          className="absolute left-0 z-0 h-1 transition-all bg-red-600 rounded-full top-5"
          style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
        />

        {/* Markers */}
        <div className="relative z-10 flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={index} className="flex flex-col items-center w-1/3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-red-600 text-white ring-4 ring-red-100"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <p
                  className={`text-sm font-medium mt-3 text-center transition-all ${
                    isCurrent || isCompleted ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
