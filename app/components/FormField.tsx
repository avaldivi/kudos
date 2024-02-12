import { useEffect, useState } from 'react';

interface FormFieldProps {
  htmlFor: string;
  label: string;
  type?: string;
  value?: any;
  placeholder: string;
  error?: string;
  onChange?: (...args: any) => any;
}

export function FormField({
  htmlFor,
  label,
  type = 'text',
  value,
  placeholder,
  error = '',
  onChange = () => {},
}: FormFieldProps) {
  const [errorText, setErrorText] = useState(error);

  useEffect(() => {
    setErrorText(error);
  }, [error]);
  return (
    <>
      <label htmlFor={htmlFor} className='text-blue-600 font-semibold'>
        {label}
      </label>
      <input
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e);
          setErrorText('');
        }}
        type={type}
        id={htmlFor}
        name={htmlFor}
        className='w-full p-2 rounded-xl my-2'
        defaultValue={value}
      />
      <div className='text-xs font-semibold text-center tracking-wide text-red-500 w-full'>
        {errorText || ''}
      </div>
    </>
  );
}
