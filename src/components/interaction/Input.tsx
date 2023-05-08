import React, { ChangeEvent, useState } from 'react';
import './Input.css';

/**
 * Processes the page input field changes
 */
export class InputDefinition {
    public label: string;
    public type: string;
    public value: string|number;
    public errorMessage: string|null|undefined;
    public callback: (event: ChangeEvent<HTMLInputElement>) => string|void
    private _setErrorMessage: null|((error: string ) => void) = null;

    constructor(
        label: string,
        type: string,
        value: string | number,
        errorMessage: string | null | undefined = null,
        callback: (event: ChangeEvent<HTMLInputElement>) => string|void
    ) {
            this.label = label;
            this.type = type;
            this.value = value;
            this.errorMessage = errorMessage;
            this.callback = callback;
    }

    set setErrorMessage(callback: null|((error: string ) => void)) {
        this._setErrorMessage = callback;
    }

    /**
     * When there is a new error message we must use this function if we
     * want to rerender the input field with the error message. setErrorMessage
     * function deals with the rerender.
     * @param error 
     * @returns 
     */
    updateErrorMessage(error: string|null|undefined): void {
        if (error) {
            this.errorMessage = error;
            this._setErrorMessage && this._setErrorMessage(error);
            return;
        }
        
        if (this.errorMessage){
            this.errorMessage = '';
            this._setErrorMessage && this._setErrorMessage(this.errorMessage);
        }
    }
}

/**
 * Component props
 */
interface InputProps {
    inputDefinition: InputDefinition
}

export const Input: React.FC<InputProps> = ({ inputDefinition }) => {
    const [errorMessage, setErrorMessage] = useState<string>('');
    inputDefinition.setErrorMessage = (error: string) => {
        if (error != null) {
            setErrorMessage(error);
        }
    }
  
    return (
        <div className="styled-input">
            <label>{inputDefinition.label}</label>
            <input type={inputDefinition.type} defaultValue={inputDefinition.value} onChange={inputDefinition.callback} />
            {errorMessage && <span style={{ color: 'red' }}>{errorMessage}</span>}
        </div>
    )
}
