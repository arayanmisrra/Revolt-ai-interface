
import React from 'react';
import { Status } from '../types';
import { MicIcon, SquareIcon } from './Icons';

interface MicButtonProps {
  status: Status;
  onClick: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({ status, onClick }) => {
  const isListening = status === Status.Listening;
  const isProcessing = status === Status.Processing;

  const getButtonClasses = () => {
    let classes = 'relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4';
    if (isListening) {
      classes += ' bg-red-600 text-white ring-red-500/50';
    } else if (isProcessing) {
      classes += ' bg-gray-600 text-white ring-gray-500/50 cursor-not-allowed';
    } else {
      classes += ' bg-indigo-600 text-white hover:bg-indigo-700 ring-indigo-500/50';
    }
    return classes;
  };

  const getPulseClasses = () => {
    let classes = 'absolute inline-flex h-full w-full rounded-full opacity-75';
    if (isListening) {
        classes += ' animate-ping bg-red-500';
    } else if (isProcessing) {
        classes += ' animate-pulse bg-gray-500';
    }
    return classes;
  };
  
  return (
    <button className={getButtonClasses()} onClick={onClick} disabled={isProcessing}>
       { (isListening || isProcessing) && <span className={getPulseClasses()}></span>}
      <span className="relative z-10">
        {isListening ? <SquareIcon className="w-8 h-8"/> : <MicIcon className="w-8 h-8"/>}
      </span>
    </button>
  );
};

export default MicButton;
