import React from 'react';
import { motion } from 'motion/react';

interface WaveformProps {
  isListening?: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({ isListening = false }) => {
  // 7 bars as specified in the original markup
  const bars = [
    { baseHeight: 12, delay: 0.1, activeMultiplier: 1.8 },
    { baseHeight: 22, delay: 0.2, activeMultiplier: 1.5 },
    { baseHeight: 32, delay: 0.3, activeMultiplier: 1.3 },
    { baseHeight: 20, delay: 0.4, activeMultiplier: 1.7 },
    { baseHeight: 28, delay: 0.5, activeMultiplier: 1.4 },
    { baseHeight: 18, delay: 0.6, activeMultiplier: 1.6 },
    { baseHeight: 10, delay: 0.7, activeMultiplier: 2.0 },
  ];

  return (
    <div
      id="waveform-container"
      className="flex items-center justify-center gap-1.5 h-[38px] my-4"
      aria-label="Voice waveform audio indicator"
    >
      {bars.map((bar, index) => (
        <motion.span
          key={index}
          className={`w-[4px] rounded-full transition-colors duration-300 ${
            isListening
              ? 'bg-gradient-to-t from-emerald-400 via-[#397cff] to-[#a855f7] shadow-[0_0_8px_rgba(57,124,255,0.7)]'
              : 'bg-[#397cff] shadow-[0_0_6px_rgba(57,124,255,0.35)]'
          }`}
          animate={{
            height: isListening
              ? [bar.baseHeight * 0.6, bar.baseHeight * bar.activeMultiplier, bar.baseHeight * 0.8]
              : [bar.baseHeight * 0.5, bar.baseHeight * 1.25, bar.baseHeight * 0.5],
            opacity: isListening ? [0.8, 1, 0.9] : [0.75, 1, 0.75],
          }}
          transition={{
            duration: isListening ? 0.65 : 1.1,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: bar.delay,
          }}
          style={{ minHeight: '6px' }}
        />
      ))}
    </div>
  );
};
