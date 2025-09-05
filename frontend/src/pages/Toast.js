import React, { useEffect } from "react";
import "./Toast.css";

export default function Toast({ message, duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast-container">
      <div className="toast-message">{message}</div>
    </div>
  );
}
