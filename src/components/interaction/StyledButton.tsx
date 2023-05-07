import React from "react";
import './StyledButton.css'

interface ButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, children }) => {
    return (
        <button disabled={disabled} className="styled-button" onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;