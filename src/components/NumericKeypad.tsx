import React from 'react';
import { Delete } from 'lucide-react';
import { triggerHaptic } from '../utils/haptic';

interface NumericKeypadProps {
  onDigitClick: (digit: string) => void;
  onClearClick: () => void;
  onBackspaceClick: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onDigitClick,
  onClearClick,
  onBackspaceClick
}) => {
  const rows = [
    [
      { digit: '1', letters: '' },
      { digit: '2', letters: 'ABC' },
      { digit: '3', letters: 'DEF' }
    ],
    [
      { digit: '4', letters: 'GHI' },
      { digit: '5', letters: 'JKL' },
      { digit: '6', letters: 'MNO' }
    ],
    [
      { digit: '7', letters: 'PQRS' },
      { digit: '8', letters: 'TUV' },
      { digit: '9', letters: 'WXYZ' }
    ],
    [
      { digit: 'CLR', letters: '' },
      { digit: '0', letters: '+' },
      { digit: 'DEL', letters: '' }
    ]
  ];

  return (
    <div className="w-full flex flex-col items-center gap-2 px-6">
      {rows.map((row, rIdx) => (
         <div key={rIdx} className="flex justify-between items-center w-[290px]">
          {row.map((item) => {
            const isClr = item.digit === 'CLR';
            const isDel = item.digit === 'DEL';

            return (
              <button
                key={item.digit}
                type="button"
                data-testid={`keypad_btn_${item.digit}`}
                onClick={() => {
                  if (isClr) {
                    triggerHaptic('medium');
                    onClearClick();
                  } else if (isDel) {
                    triggerHaptic('medium');
                    onBackspaceClick();
                  } else {
                    triggerHaptic('light');
                    onDigitClick(item.digit);
                  }
                }}
                className="w-[84px] h-[52px] rounded-2xl flex flex-col items-center justify-center transition-all duration-150 ease-out active:scale-90 active:bg-slate-200 hover:bg-slate-100 bg-slate-50 border border-slate-200/60 text-slate-800 shadow-xs cursor-pointer select-none"
              >
                {isClr ? (
                  <span className="text-[12px] font-bold tracking-wider text-slate-400">CLR</span>
                ) : isDel ? (
                  <Delete className="w-5 h-5 text-slate-600" />
                ) : (
                  <>
                    <span className="text-[20px] font-bold leading-none font-mono">{item.digit}</span>
                    {item.letters && (
                      <span className="text-[9px] font-semibold text-slate-400 tracking-wider mt-0.5">
                        {item.letters}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
