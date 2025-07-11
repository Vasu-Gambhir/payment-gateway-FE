const InputBox = ({
  label,
  placeholder,
  name,
  value,
  onChange,
  type,
  disabled,
}) => {
  return (
    <div>
      <div className="text-sm font-medium text-left py-2">{label}</div>
      <input
        placeholder={placeholder}
        className="w-full px-2 py-1 border rounded border-slate-200"
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        disabled={disabled}
      />
    </div>
  );
};

export default InputBox;
