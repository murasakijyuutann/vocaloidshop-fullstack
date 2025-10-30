import React, { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styled from "styled-components";
import { ToastContext } from "../context/ToastContextBase";
import type { ToastType } from "../context/ToastContextBase";

export type Toast = { id: string; message: string; type?: ToastType };

const Wrap = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
`;

const ToastItem = styled(motion.div)<{ type?: Toast["type"] }>`
  background: ${({ type, theme }) => type === "error" ? "#e74c3c" : type === "success" ? theme.colors.primary : "#333"};
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  max-width: 320px;
`;

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type?: ToastType) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Wrap>
        <AnimatePresence>
          {toasts.map(t => (
            <ToastItem
              key={t.id}
              type={t.type}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {t.message}
            </ToastItem>
          ))}
        </AnimatePresence>
      </Wrap>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
