import React from 'react';
import { projectStatuses, rfpStatuses } from '../../utils/constants';

interface ShowStatusProps {
  status: number;
  type: 'proposal' | 'vendors' | 'rfps' | 'tendors';
}

const ShowStatus: React.FC<ShowStatusProps> = ({ status, type }) => {
  const getStatusClass = () => {
    switch (status) {
      case 0:
        return 'bg-orange-100 text-orange-700 border-orange-500 max-w-32';
      //approved
      case 1:
        return 'bg-blue-100 text-blue-700 border-blue-500 max-w-16';
      //rejected
      case 2:
        return 'bg-red-100 text-red-700 border-red-500';
      //sent for clarification
      case 3:
        return 'bg-yellow-100 text-orange-700 border-orange-500 max-w-32';
      //sent for approval   
      case 4:
        return 'bg-orange-100 text-orange-700 border-orange-500 max-w-32';
      //published
      case 5:
        return 'bg-green-100 text-green-700 border-green-500';
      //closed
      case 6:
        return 'bg-green-100 text-green-700 border-green-500';
      //pending
      case 7:
        return 'bg-orange-100 text-orange-700 border-orange-500 max-w-32';
      //sent for open proposal
      case 8:
        return 'bg-orange-100 text-orange-700 border-orange-500 max-w-32';
      //under evaluation
      case 9:
        return 'bg-orange-100 text-orange-700 border-orange-500 max-w-32';
      //under award
      case 10:
        return 'bg-orange-100 text-orange-700 border-orange-500 max-w-32';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-500';
    }
  };

  // Find the label dynamically based on type
  const getStatusLabel = () => {
    const statusList =
      type === 'proposal' ? projectStatuses :
        type === 'vendors' ? rfpStatuses :
          rfpStatuses; // default to requestStatuses

    return statusList.find((e: any) => e.value === status)?.label || status;
  };

  return (
    <button className={`py-1 px-2 text-xs border rounded-full flex justify-center ${getStatusClass()}`}>
      {getStatusLabel()}
    </button>
  );
};

export default ShowStatus;
