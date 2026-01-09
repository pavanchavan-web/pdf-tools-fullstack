import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = (type, message) => {
    const id = Date.now();

    setToasts(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 8000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm
              ${t.type === "error" && "bg-red-600"}
              ${t.type === "warning" && "bg-yellow-500"}
              ${t.type === "success" && "bg-green-600"}
              ${t.type === "info" && "bg-blue-600"}
            `}
          >
            {t.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotificationContext);
}
