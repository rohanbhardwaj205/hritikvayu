"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CreditCard, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressStep } from "./AddressStep";
import { PaymentStep } from "./PaymentStep";
import type { Address } from "@/types";

const steps = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
];

interface CheckoutFormProps {
  className?: string;
}

export function CheckoutForm({ className }: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const handleAddressContinue = (address: Address) => {
    setSelectedAddress(address);
    setCurrentStep(2);
  };

  const handleBackToAddress = () => {
    setCurrentStep(1);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  currentStep > step.id
                    ? "border-success bg-success text-white"
                    : currentStep === step.id
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-card text-muted"
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:block",
                  currentStep >= step.id ? "text-foreground" : "text-muted"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="mx-4 sm:mx-6 h-0.5 w-12 sm:w-20 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: currentStep > step.id ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: currentStep === 1 ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 1 && (
          <AddressStep onContinue={handleAddressContinue} />
        )}

        {currentStep === 2 && selectedAddress && (
          <PaymentStep
            address={selectedAddress}
            onBack={handleBackToAddress}
          />
        )}
      </motion.div>
    </div>
  );
}
