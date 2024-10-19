import React, { type PropsWithChildren } from "react";
import styles from "./Button.module.css";

type ButtonProps = PropsWithChildren & {
  icon?: React.ReactNode;
  onClick?: React.DOMAttributes<HTMLButtonElement>["onClick"];
  secondary?: boolean;
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  onClick,
  secondary,
  className = "",
}) => (
  <button
    className={`${styles.wrapper} ${secondary ? styles.secondary : ""} ${className}`}
    type="button"
    onClick={onClick}
  >
    {icon} {children}
  </button>
);
