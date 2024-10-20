import React from "react";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  containerClassName = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${containerClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={styles.closeButton}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
