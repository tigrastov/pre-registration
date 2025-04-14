import { useEffect, useState } from 'react';
import './Notification.css';

export default function Notification({ message, type, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div className={`notification ${type} ${isClosing ? 'slide-out' : ''}`}>
      <div className="notification-content">
        {type === 'success' ? (
          <svg className="notification-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
          </svg>
        ) : (
          <svg className="notification-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M13 13H11V7H13M13 17H11V15H13M12 2C6.47 2 2 6.5 2 12S6.47 22 12 22 22 17.5 22 12 17.53 2 12 2Z" />
          </svg>
        )}
        <span>{message}</span>
      </div>
      <button className="notification-close" onClick={handleClose}>
        &times;
      </button>
    </div>
  );
}