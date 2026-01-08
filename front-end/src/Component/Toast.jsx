import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ id, type = 'info', message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-yellow-500" />,
    info: <Info size={20} className="text-blue-500" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${styles[type]} border rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 min-w-[300px] max-w-md animate-slide-in-right`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export class ToastContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toasts: [],
    };
    this.toastId = 0;
  }

  show = (type, message, duration = 5000) => {
    const id = ++this.toastId;
    this.setState((prevState) => ({
      toasts: [...prevState.toasts, { id, type, message, duration }],
    }));
    return id;
  };

  success = (message, duration) => this.show('success', message, duration);
  error = (message, duration) => this.show('error', message, duration);
  warning = (message, duration) => this.show('warning', message, duration);
  info = (message, duration) => this.show('info', message, duration);

  removeToast = (id) => {
    this.setState((prevState) => ({
      toasts: prevState.toasts.filter((toast) => toast.id !== id),
    }));
  };

  render() {
    return (
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
        {this.state.toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={this.removeToast}
          />
        ))}
      </div>
    );
  }
}

// Create a singleton instance
let toastInstance = null;

export const getToast = () => {
  if (!toastInstance) {
    toastInstance = new ToastContainer();
  }
  return toastInstance;
};

export default Toast;




