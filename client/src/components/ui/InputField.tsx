import {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from 'react-hook-form';
import TextField from '@mui/material/TextField';

interface InputFieldProps<T extends FieldValues> {
  type: string;
  label: string;
  error: boolean;
  register: UseFormRegister<T>;
  registerName: Path<T>;
  validationOptions: RegisterOptions<T>;
  isDarkTheme?: boolean;
  [key: string]: unknown;
}

const InputField = <T extends FieldValues>({
  type,
  label,
  error,
  register,
  registerName,
  validationOptions,
  isDarkTheme,
  ...props
}: InputFieldProps<T>) => {
  return (
    <TextField
      type={type}
      label={label}
      error={error}
      InputLabelProps={{
        sx: {
          fontWeight: 500,
          color: error ? '#d32f2f' : isDarkTheme ? '#C1C4CB' : '#1D1F22', // Default label color
          '&.Mui-focused': {
            color: error ? '#d32f2f' : isDarkTheme ? '#C1C4CB' : '#1D1F22', // Label color when focused
          },
        },
      }}
      InputProps={{
        sx: {
          fontWeight: 500,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: error
              ? '#d32f2f'
              : isDarkTheme
                ? '#C1C4CB'
                : '#1D1F22', // border color
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: error
              ? '#d32f2f'
              : isDarkTheme
                ? '#C1C4CB'
                : '#1D1F22', // Border color on hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: error
              ? '#d32f2f'
              : isDarkTheme
                ? '#C1C4CB'
                : '#1D1F22', // Border color when focused
          },
          '& .MuiInputBase-input': {
            color: isDarkTheme ? '#C1C4CB' : '#1D1F22', // input text color
          },
        },
      }}
      id={`outline-${String(registerName)}`}
      variant='outlined'
      {...register(registerName, validationOptions)}
      {...props}
    />
  );
};

export default InputField;
