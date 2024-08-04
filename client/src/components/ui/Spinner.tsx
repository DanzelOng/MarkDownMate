interface SpinnerProps {
  size: 'sm' | 'md' | 'screen';
}

const Spinner = ({ size }: SpinnerProps) => {
  const widths = {
    sm: 'w-4',
    md: 'w-6',
  };
  return size !== 'screen' ? (
    <div
      className={`${widths[size]} aspect-square animate-spin rounded-full border-2 border-slate-250 border-t-slate-350`}
    ></div>
  ) : (
    <div
      className={`aspect-square w-[10rem] animate-spin rounded-full border-[0.375rem] border-slate-300 border-t-slate-350`}
    ></div>
  );
};

export default Spinner;
