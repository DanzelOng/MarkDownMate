import markdown from '/assets/markdown.svg';

interface EyePreviewProps {
  isDarkTheme: boolean;
  previewMode: boolean;
  setPreviewMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const EyePreview = ({
  isDarkTheme,
  previewMode,
  setPreviewMode,
}: EyePreviewProps) => {
  const togglePreview = () => setPreviewMode(!previewMode);
  return (
    <button
      className="focus-visible:outline-3 transition-all duration-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-300/80 dark:focus-visible:outline-slate-200/75"
      aria-label="toggles preview icon"
      aria-controls="preview icon"
      onClick={togglePreview}
    >
      <svg
        id="preview icon"
        aria-hidden={!previewMode}
        className={`${isDarkTheme ? 'fill-slate-200' : 'fill-slate-350'} ${previewMode ? 'block' : 'hidden'} h-[1.125rem] w-[1.125rem] transition-all duration-200 hover:fill-orange-600`}
      >
        <use xlinkHref={`${markdown}#icon-hide-preview`}></use>
      </svg>
      <svg
        id="preview icon"
        aria-hidden={previewMode}
        className={`${isDarkTheme ? 'fill-slate-200' : 'fill-slate-350'} ${!previewMode ? 'block' : 'hidden'} h-[1.125rem] w-[1.125rem] transition-all duration-200 hover:fill-orange-600`}
      >
        <use xlinkHref={`${markdown}#icon-show-preview`}></use>
      </svg>
    </button>
  );
};

export default EyePreview;
