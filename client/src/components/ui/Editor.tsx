import { ChangeEvent } from 'react';
import EyePreview from './EyePreview';
import MarkdownModel from '../../models/markdown';

interface EditorProps {
  isDarkTheme?: boolean;
  previewMode?: boolean;
  setPreviewMode?: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile?: boolean;
  id: string;
  documents: MarkdownModel[];
  setDocuments: React.Dispatch<React.SetStateAction<MarkdownModel[]>>;
}

const Editor = ({
  isDarkTheme,
  previewMode,
  setPreviewMode,
  isMobile,
  id,
  documents,
  setDocuments,
}: EditorProps) => {
  const currentDocument: MarkdownModel | undefined = documents.find(
    (document) => document._id === id
  );

  const writeContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDocuments((documents) =>
      documents.map((doc) =>
        doc._id === id ? { ...doc, content: e.target.value } : doc
      )
    );
  };

  return (
    <div className='border-slate-150 bg-slate-50 dark:border-slate-300'>
      {isMobile ? (
        <div className='flex items-center justify-between bg-slate-100 px-[1.25rem] py-3 transition-all duration-300 dark:bg-slate-450'>
          <h3 className='font-roboto text-sm uppercase tracking-[0.1em] text-slate-300 transition-all duration-300 dark:text-slate-200'>
            Markdown
          </h3>
          <EyePreview
            isDarkTheme={isDarkTheme as boolean}
            previewMode={previewMode as boolean}
            setPreviewMode={
              setPreviewMode as React.Dispatch<React.SetStateAction<boolean>>
            }
          />
        </div>
      ) : (
        <h3 className='bg-slate-100 px-[1.25rem] py-3 font-roboto text-sm uppercase tracking-[0.1em] text-slate-350 transition-all duration-300 dark:bg-slate-450 dark:text-slate-200'>
          MarkDown
        </h3>
      )}

      <textarea
        className='h-[calc(100%-2.75rem)] w-full resize-none overflow-y-auto px-[1.25rem] py-5 text-slate-350 transition-all duration-300 scrollbar-thin placeholder:text-slate-250 focus:outline-none  dark:bg-slate-500 dark:text-slate-200 dark:placeholder:text-slate-200'
        onChange={writeContent}
        placeholder='Begin writing!'
        value={currentDocument?.content || ''}
      />
    </div>
  );
};

export default Editor;
