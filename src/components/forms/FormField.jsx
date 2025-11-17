import { forwardRef } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const FormField = forwardRef(({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  textarea = false,
  rows = 3,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {textarea ? (
        <Textarea
          id={id}
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          className={error ? 'border-red-500' : ''}
          {...props}
        />
      ) : (
        <Input
          id={id}
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={error ? 'border-red-500' : ''}
          {...props}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = "FormField";

export { FormField };