import React, { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  SignalSlashIcon, 
  CloudArrowUpIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { 
  isOnline, 
  setupOnlineListener, 
  processOfflineQueue,
  queueOfflineAction
} from '../../utils/serviceWorker';

const OfflineIndicator = ({ className = '' }) => {
  const [online, setOnline] = useState(isOnline());
  const [showIndicator, setShowIndicator] = useState(!isOnline());
  const [queueSize, setQueueSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      setShowIndicator(false);
      
      // Process queued offline actions
      if (queueSize > 0) {
        setIsProcessing(true);
        try {
          await processOfflineQueue();
          setQueueSize(0);
        } catch (error) {
          console.error('Failed to process offline queue:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    const handleOffline = () => {
      setOnline(false);
      setShowIndicator(true);
    };

    const cleanup = setupOnlineListener(handleOnline, handleOffline);
    
    return cleanup;
  }, [queueSize]);

  // Auto-hide online indicator after a delay
  useEffect(() => {
    if (online && showIndicator) {
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [online, showIndicator]);

  const getIndicatorContent = () => {
    if (isProcessing) {
      return {
        icon: <CloudArrowUpIcon className="w-5 h-5 animate-pulse" />,
        text: `Syncing ${queueSize} items...`,
        bgColor: 'bg-blue-500',
        textColor: 'text-white'
      };
    }

    if (!online) {
      return {
        icon: <SignalSlashIcon className="w-5 h-5" />,
        text: 'You are offline',
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        subtitle: queueSize > 0 ? `${queueSize} actions queued` : 'Some features may be limited'
      };
    }

    return {
      icon: <WifiIcon className="w-5 h-5" />,
      text: 'You are back online',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    };
  };

  if (!showIndicator && online) {
    return null;
  }

  const { icon, text, bgColor, textColor, subtitle } = getIndicatorContent();

  return (
    <div className={cn('fixed top-4 left-1/2 transform -translate-x-1/2 z-50', className)}>
      <div 
        className={cn(
          'flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg',
          'backdrop-blur-sm border',
          bgColor,
          textColor,
          'transition-all duration-300 ease-in-out',
          showIndicator ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        )}
      >
        {icon}
        <div>
          <div className="font-medium text-sm">{text}</div>
          {subtitle && (
            <div className="text-xs opacity-90">{subtitle}</div>
          )}
        </div>
        
        {!online && (
          <ExclamationTriangleIcon className="w-4 h-4 opacity-75" />
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;