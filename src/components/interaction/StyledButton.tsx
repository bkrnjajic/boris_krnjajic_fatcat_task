import React from "react";
import './StyledButton.css'

interface ButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
    return (
        <button className="styled-button" onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;