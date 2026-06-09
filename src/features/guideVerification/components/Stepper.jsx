import { Check } from "lucide-react";

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <ol className="mx-auto flex min-w-[760px] items-center justify-between gap-2 lg:min-w-0">
        {steps.map((item, index) => {
          const isCompleted = currentStep > item.id;
          const isActive = currentStep === item.id;
          const isConnectorCompleted = currentStep > item.id + 1;

          return (
            <li
              key={item.id}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="flex flex-col items-center">
                {isCompleted ? (
                  <div className="grid h-14 w-14 place-items-center rounded-full border border-[#d7bf55] bg-[#d7bf55] text-[#121345] shadow-[0_4px_14px_rgba(28,27,83,0.2)]">
                    <Check className="h-6 w-6" />
                  </div>
                ) : isActive ? (
                  <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#d7bf55] bg-white shadow-[0_0_0_6px_rgba(215,191,85,0.2)]">
                    <span className="text-lg font-semibold text-[#161543]">
                      {item.id}
                    </span>
                  </div>
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full border border-[#c9c7d8] bg-white">
                    <span className="text-lg font-semibold text-[#9b99ad]">
                      {item.id}
                    </span>
                  </div>
                )}
                <span className="mt-3 whitespace-nowrap text-sm font-medium text-[#2a2b56]">
                  {item.label}
                </span>
              </div>

              {index < steps.length - 1 ? (
                <span
                  className={`h-[2px] flex-1 rounded-full ${
                    isConnectorCompleted ? "bg-[#d7bf55]" : "bg-[#d2d1df]"
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Stepper;
