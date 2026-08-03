/**
 * Input component — text input with label, error message, and icon support.
 */

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon,
  className = '',
  inputClassName = '',
  inputStyle = {},
  ...props
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-lg sm:text-xl font-extrabold text-slate-800"
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-500">
            {icon}
          </span>
        )}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full py-4 ${icon ? 'pl-14 pr-5' : 'px-5'} text-lg sm:text-xl bg-slate-50 text-slate-900 border-2 ${error ? 'border-red-500' : 'border-slate-300'} rounded-2xl focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 outline-none transition-all ${inputClassName}`}
          style={inputStyle}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-base font-bold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
