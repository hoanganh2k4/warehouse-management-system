import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type?: 'error' | 'success';
  onClose: () => void;
  durationMs?: number;
};

export function Toast({ message, type = 'error', onClose, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      <p>{message}</p>
      <button className="toast-close" onClick={onClose} aria-label="Đóng thông báo">
        ×
      </button>
    </div>
  );
}
