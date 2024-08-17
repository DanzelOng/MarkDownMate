import { KeyboardEvent } from 'react';
import themes from '/assets/themes.svg';

interface SliderProps {
  isDarkTheme: boolean;
  setDarkTheme: React.Dispatch<React.SetStateAction<boolean>>;
}

const Switch = ({ isDarkTheme, setDarkTheme }: SliderProps) => {
  const toggleDarkTheme = () => setDarkTheme((theme) => !theme);

  const onFocusedToggleMode = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter') {
      toggleDarkTheme();
    }
  };

  return (
    <div className='flex items-center gap-x-3'>
      <svg
        className={`${isDarkTheme ? 'fill-slate-50' : 'fill-slate-300'} h-[1.125rem] w-[1.125rem] transition-all duration-200`}
      >
        <use xlinkHref={`${themes}#icon-dark-mode`}></use>
      </svg>
      <label htmlFor='switch' className='cursor-pointer'>
        <input
          className='hidden'
          type='checkbox'
          id='switch'
          onClick={toggleDarkTheme}
        />
        <span
          onKeyDown={onFocusedToggleMode}
          tabIndex={0}
          className={`${isDarkTheme ? 'before:ml-2 before:translate-x-0' : 'before:mr-2 before:translate-x-[230%]'} focus-visible:outline-3 relative block h-[1.5rem] w-[3rem] rounded-full bg-slate-300 transition-all duration-200 before:absolute before:top-[50%] before:h-[0.75rem] before:w-[0.75rem] before:translate-y-[-50%] before:rounded-full before:bg-slate-50 before:transition-all before:duration-300 focus-visible:outline focus-visible:outline-slate-200/70`}
        ></span>
      </label>
      <svg
        className={`${!isDarkTheme ? 'fill-slate-50' : 'fill-slate-300'} h-[1.125rem] w-[1.125rem] transition-all duration-200`}
      >
        <use xlinkHref={`${themes}#icon-light-mode`}></use>
      </svg>
    </div>
  );
};

export default Switch;
