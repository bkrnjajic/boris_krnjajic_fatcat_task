import React from 'react';
import './Input.css';

interface InputProps {
    label: string;
    type: string;
    value: string|number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ label, type, value, onChange }) => {
    return (
        <div className="styled-input">
            <label>{label}</label>
            <input type={type} value={value} onChange={onChange} />
        </div>
    );
};

export default Input;