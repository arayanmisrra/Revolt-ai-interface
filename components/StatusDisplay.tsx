
import React from 'react';
import { Status } from '../types';

interface StatusDisplayProps {
  status: Status;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  const getStatusText = () => {
    switch (status) {
      case Status.Listening:
        return 'Listening...';
      case Status.Processing:
        return 'Thinking...';
      case Status.Speaking:
        return 'Speaking...';
      case Status.Idle:
      default:
        return 'Click the mic to start';
    }
  };

  return (
    <div className="h-6 text-center">
        <p className="text-gray-400 text-lg transition-opacity duration-300">{getStatusText()}</p>
    </div>
  );
};

export default StatusDisplay;
