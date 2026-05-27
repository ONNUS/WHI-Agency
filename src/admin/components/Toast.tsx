import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onDismiss, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss]);

  const icon =
    type === 'success' ? (
      <CheckCircle className="w-4 h-4 text-[#308c5f]" />
    ) : type === 'error' ? (
      <XCircle className="w-4 h-4 text-[#b13b3f]" />
    ) : (
      <AlertCircle className="w-4 h-4 text-[#bc993c]" />
    );

  const borderColor =
    type === 'success'
      ? 'border-[#308c5f]/40'
      : type === 'error'
      ? 'border-[#b13b3f]/40'
      : 'border-[#bc993c]/40';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#12151c] border ${borderColor} rounded px-4 py-3 shadow-lg font-mono text-sm text-[#e8e4da] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {icon}
      {message}
    </div>
  );
}
