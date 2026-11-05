import React from 'react';
import { Check, Clock, Flame, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

export default function LiveStatusStepper({ status, createdAt, updatedAt, isLive = true }) {
  const steps = [
    {
      id: 'PLACED',
      name: 'Placed',
      label: 'Ticket Placed',
      description: 'Kitchen acknowledged order',
      icon: Clock,
    },
    {
      id: 'PREPARING',
      name: 'Preparing',
      label: 'Crafting & Brewing',
      description: 'Chef Arabito is cooking',
      icon: Flame,
    },
    {
      id: 'READY',
      name: 'Ready',
      label: 'Ready to Serve',
      description: 'At table or pickup counter',
      icon: CheckCircle2,
    },
  ];

  // Map status to active index (0: Placed, 1: Preparing, 2: Ready, 3: Completed)
  let activeIndex = 0;
  if (status === 'PREPARING') activeIndex = 1;
  else if (status === 'READY') activeIndex = 2;
  else if (status === 'COMPLETED') activeIndex = 3;

  const isCancelled = status === 'CANCELLED';

  // Calculate progress width percentage: 0% -> 50% -> 100%
  const progressPercent = isCancelled
    ? 0
    : Math.min(100, Math.max(0, (activeIndex / (steps.length - 1)) * 100));

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="rounded-3xl bg-ivory border border-sage/30 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Stepper Header with Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-sage/20">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-coffee">
            Station Status Feed
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest mt-0.5">
            {isCancelled
              ? 'Order Ticket Cancelled'
              : status === 'COMPLETED'
              ? 'Order Completed'
              : status === 'READY'
              ? 'Order is Ready!'
              : status === 'PREPARING'
              ? 'Currently in Kitchen Preparation'
              : 'Order Placed & Confirmed'}
          </h3>
        </div>

        {/* Live SSE Pulse Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-forest/10 border border-forest/20 text-xs font-semibold text-forest self-start sm:self-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-forest" />
          </span>
          <span className="font-medium">
            {isLive ? 'Live Kitchen Sync' : 'Polled Sync'}
          </span>
        </div>
      </div>

      {isCancelled ? (
        <div className="p-6 rounded-2xl bg-charcoal/5 border border-charcoal/20 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-coffee mx-auto" />
          <h4 className="font-serif text-lg font-bold text-forest">Order Was Cancelled</h4>
          <p className="text-xs text-charcoal/70 max-w-sm mx-auto font-sans">
            This order ticket was cancelled before completion. Please visit the front counter if this was unexpected.
          </p>
        </div>
      ) : (
        /* Stepper Steps & Progress Line */
        <div className="relative pt-2 pb-4">
          {/* Background Track Line */}
          <div className="absolute top-7 left-12 right-12 h-1 bg-sage/25 -translate-y-1/2 z-0 hidden sm:block" />

          {/* Active Fill Line */}
          <div
            className="absolute top-7 left-12 h-1 bg-forest -translate-y-1/2 z-0 transition-all duration-700 ease-out hidden sm:block"
            style={{ width: `calc(${progressPercent}% * (100% - 6rem) / 100)` }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-2 relative z-10">
            {steps.map((step, idx) => {
              const isFinished = activeIndex > idx || activeIndex === 3;
              const isCurrent = activeIndex === idx && activeIndex !== 3;
              const isUpcoming = activeIndex < idx;

              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3"
                >
                  {/* Step Bubble Circle */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all duration-500 shrink-0 ${
                      isFinished
                        ? 'bg-forest text-ivory shadow-soft'
                        : isCurrent
                        ? 'bg-coffee text-ivory shadow-md ring-4 ring-coffee/20 scale-105'
                        : 'bg-ivory border-2 border-sage/40 text-charcoal/40'
                    }`}
                  >
                    {isFinished ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : isCurrent ? (
                      <Icon className="w-6 h-6 animate-pulse" />
                    ) : (
                      <span className="font-serif text-base">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Meta */}
                  <div className="flex-1 sm:flex-initial">
                    <div className="flex sm:justify-center items-center gap-1.5">
                      <span
                        className={`text-xs uppercase font-bold tracking-wider ${
                          isCurrent
                            ? 'text-coffee'
                            : isFinished
                            ? 'text-forest'
                            : 'text-charcoal/50'
                        }`}
                      >
                        {step.name}
                      </span>
                      {isCurrent && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-coffee animate-ping" />
                      )}
                    </div>

                    <h4 className="font-serif text-base sm:text-lg font-bold text-forest leading-snug">
                      {step.label}
                    </h4>

                    <p className="text-xs text-charcoal/70 font-sans mt-0.5">
                      {step.description}
                    </p>

                    {/* Step specific timestamp */}
                    {idx === 0 && createdAt && (
                      <span className="inline-block text-[10px] text-charcoal/60 mt-1">
                        Placed: {formatTimestamp(createdAt)}
                      </span>
                    )}
                    {idx === activeIndex && updatedAt && (
                      <span className="inline-block text-[10px] text-coffee font-semibold mt-1">
                        Updated: {formatTimestamp(updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
