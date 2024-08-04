import ErrorIcon from '@mui/icons-material/Error';

interface ErrorMsgProps {
  msg: string;
}

const ErrorMsg = ({ msg }: ErrorMsgProps) => {
  return (
    <div className="mb-3 flex items-center gap-x-1.5 text-balance rounded bg-red-500 p-1.5 text-[0.8125rem] text-slate-50">
      <ErrorIcon sx={{ width: '1.125rem', height: '1.125rem' }} />
      <p className="leading-5">{msg}</p>
    </div>
  );
};

export default ErrorMsg;
