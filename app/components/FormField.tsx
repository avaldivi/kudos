interface FormFieldProps {
  htmlFor: string;
  label: string;
  type?: string;
  value?: any;
  placeholder: string;
  onChange?: (...args: any) => any;
}

export function FormField({
  htmlFor,
  label,
  type = 'text',
  value,
  placeholder,
  onChange = () => {},
}: FormFieldProps) {
  return (
    <>
      <label htmlFor={htmlFor} className='text-blue-600 font-semibold'>
        {label}
      </label>
      <input
        placeholder={placeholder}
        onChange={onChange}
        type={type}
        id={htmlFor}
        name={htmlFor}
        className='w-full p-2 rounded-xl my-2'
        defaultValue={value}
      />
    </>
  );
}
