import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(function Input(
    { label, id, error, hint, required, className = '', ...props },
    ref
) {
    return (
        <div className={styles.field}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                    {required && <span className={styles.required} aria-hidden="true"> *</span>}
                </label>
            )}
            <input
                ref={ref}
                id={id}
                className={[styles.input, error ? styles.inputError : '', className].filter(Boolean).join(' ')}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
                {...props}
            />
            {hint && !error && (
                <p id={`${id}-hint`} className={styles.hint}>{hint}</p>
            )}
            {error && (
                <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>
            )}
        </div>
    );
});

export default Input;
