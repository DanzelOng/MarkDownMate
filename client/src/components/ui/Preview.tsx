import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EyePreview from './EyePreview';
import MarkdownModel from '../../models/markdown';

interface PreviewProps {
  isDarkTheme: boolean;
  previewMode: boolean;
  setPreviewMode: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile?: boolean;
  id: string;
  documents: MarkdownModel[];
}

const Preview = ({
  isDarkTheme,
  previewMode,
  setPreviewMode,
  isMobile,
  id,
  documents,
}: PreviewProps) => {
  const [previewHeight, setPreviewHeight] = useState<number>(() => {
    return window.innerHeight - (isMobile ? 56 : 72) - 44;
  });

  const currentDocument: MarkdownModel | undefined = documents.find(
    (document) => document._id === id
  );

  useEffect(() => {
    const onResize = () => {
      setPreviewHeight(window.innerHeight - (isMobile ? 56 : 72) - 44);
    };

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [isMobile, previewHeight]);

  return (
    <div
      className={`${!previewMode ? 'border-l-[0.5px]' : ''} border-slate-150 bg-slate-50 transition-all duration-300 dark:border-slate-300 dark:bg-slate-500`}
    >
      <div className='flex items-center justify-between bg-slate-100 px-[1.25rem] transition-all duration-300 dark:bg-slate-450'>
        <h3 className='py-3 font-roboto text-sm uppercase tracking-[0.1em] text-slate-350 dark:text-slate-200'>
          Preview
        </h3>
        <EyePreview
          isDarkTheme={isDarkTheme}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
        />
      </div>
      <div
        style={{
          height: previewHeight ? `${previewHeight / 16}rem` : 'revert',
        }}
      >
        <div
          className={`${previewMode && !isMobile ? 'max-w-[45rem]' : 'max-w-none'} ${isMobile ? 'max-w-full' : 'mx-auto'} preview-blockquote:font preview max-h-full overflow-y-auto bg-slate-50 px-[1.25rem] py-8 font-slab transition-all duration-300 scrollbar-thin dark:preview-invert preview-h1:text-[2rem] preview-h2:mt-8 preview-h2:text-[1.75rem] preview-h2:font-light preview-h3:text-2xl preview-h4:text-xl preview-h5:font-bold preview-h6:text-sm preview-h6:font-bold preview-h6:text-orange-600 preview-blockquote:rounded preview-blockquote:border-orange-600 preview-blockquote:bg-slate-100 preview-blockquote:px-7 preview-blockquote:py-3 preview-blockquote:text-sm preview-blockquote:font-extrabold preview-blockquote:not-italic preview-code:font-normal preview-code:text-slate-350 preview-pre:bg-slate-100 preview-ul:marker:text-orange-600 preview-li:ml-4 preview-li:text-base dark:bg-slate-500 dark:preview-blockquote:bg-slate-400 dark:preview-code:text-slate-50 dark:preview-pre:bg-slate-400`}
        >
          <Markdown
            children={currentDocument?.content || ''}
            remarkPlugins={[remarkGfm]}
          />
        </div>
      </div>
    </div>
  );
};

export default Preview;
