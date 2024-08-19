import { useRef, KeyboardEvent, MouseEvent, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { formatDate } from '../../utils/formatDate';
import { type ModalTypes } from '../modal/ModalContentFactory';
import { BadRequestError, ConflictError } from '../../utils/httpErrors';
import ErrorMsg from './ErrorMsg';
import Spinner from './Spinner';
import Switch from './Switch';
import MarkdownModel from '../../models/markdown';
import markdown from '/assets/markdown.svg';
import * as markdownAPI from '../../services/markdownAPI';
import * as authAPI from '../../services/authAPI';

interface AsideProps {
  isDarkTheme: boolean;
  setDarkTheme: React.Dispatch<React.SetStateAction<boolean>>;
  showAside: boolean;
  setShowAside: React.Dispatch<React.SetStateAction<boolean>>;
  toggleModal: () => void;
  setModalType: React.Dispatch<React.SetStateAction<ModalTypes>>;
  id: string;
  documents: MarkdownModel[];
  setDocuments: React.Dispatch<React.SetStateAction<MarkdownModel[]>>;
  setCurrentDocumentId: React.Dispatch<React.SetStateAction<string>>;
}

interface FormProps {
  file: FileList;
}

const Aside = ({
  isDarkTheme,
  setDarkTheme,
  showAside,
  setShowAside,
  toggleModal,
  setModalType,
  id,
  documents,
  setDocuments,
  setCurrentDocumentId,
}: AsideProps) => {
  const inputEl = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    clearErrors,
    watch,
    reset,
    formState: { errors: formError, isSubmitting, isValid },
  } = useForm<FormProps>();
  const { ref, ...rest } = register('file', {
    required: 'Please select a file',
    // validations
    validate: {
      matchPattern: (data) => {
        const fileExtension = data[0].name.split('.').pop();
        return fileExtension === 'md' || 'Only accept markdown files';
      },
      preventDuplicateNaming: (data) => {
        // early return if documents are empty
        if (!documents.length) return;
        const document = documents.find((doc) => doc.fileName === data[0].name);
        return document ? 'There is already a document with this name' : true;
      },
    },
  });

  const navigate = useNavigate();
  const file = watch('file');

  useEffect(() => {
    if (!showAside) {
      if (getValues('file').length) {
        reset();
      } else if (formError.file?.message) {
        clearErrors();
      }
    }
  }, [showAside, getValues, clearErrors, reset, formError.file?.message]);

  // uploads the markdown document
  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    const { file } = data;
    const formData = new FormData();

    formData.append('file', file[0]);

    try {
      // upload markdown document
      const document = await markdownAPI.uploadFile(formData);

      setCurrentDocumentId(document._id);

      // update documents
      setDocuments((documents) => [...documents, document]);

      toast.success('Successfully uploaded document!');
      setShowAside(false);
    } catch (error) {
      if (error instanceof ConflictError || error instanceof BadRequestError) {
        setError('file', { type: 'custom', message: error.message });
      } else {
        toast.error((error as Error).message, { id: 'server-error' });
      }
    } finally {
      reset(undefined, { keepErrors: true });
    }
  };

  // downloads a markdown document
  const onDownload = async (
    event: MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    event.stopPropagation();
    try {
      const { fileName, blob } = await markdownAPI.downloadDocument(id);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error((error as Error).message, { id: 'server-error' });
    }
  };

  // logs the user out
  const onLogOut = async () => {
    try {
      await authAPI.logout();
      const toastId = toast.success('Logging you out...');
      setTimeout(() => {
        toast.dismiss(toastId);
        navigate('/');
      }, 1850);
    } catch (error) {
      toast.error((error as Error).message, { id: 'server-error' });
    }
  };

  const onDocumentClick = (id: string) => {
    // updates current viewed document Id and save to localstorage
    localStorage.setItem('currentViewedDocumentId', JSON.stringify(id));
    setCurrentDocumentId(id);
    setShowAside(false);
  };

  const onFocusedDocumentClick = (
    e: KeyboardEvent<HTMLLIElement>,
    id: string
  ) => {
    if (e.key === 'Enter') {
      onDocumentClick(id);
    }
  };

  const onFocusedOpenFile = (e: KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === 'Enter' && inputEl.current) {
      inputEl.current.click();
    }
  };

  return (
    <aside
      className={`${showAside ? 'translate-x-0' : 'translate-x-[-15.625rem]'} fixed flex h-dvh min-w-[15.625rem] max-w-[15.625rem] flex-col bg-slate-450 px-6 py-7 font-roboto transition-all duration-500`}
    >
      <h3 className='text-sm font-medium uppercase tracking-widest text-slate-250'>
        My Documents
      </h3>
      <div className='mt-4 flex flex-col gap-y-5'>
        <form onSubmit={handleSubmit(onSubmit)}>
          {formError?.file?.message && (
            <ErrorMsg msg={formError.file.message} />
          )}
          <div className='flex justify-between'>
            <label
              tabIndex={0}
              onKeyDown={onFocusedOpenFile}
              htmlFor='file'
              className={`${isSubmitting ? 'cursor-not-allowed bg-slate-250' : 'cursor-pointer bg-orange-600 hover:bg-orange-500'} focus-visible:outline-3 rounded p-2.5 transition-all duration-200 focus-visible:outline focus-visible:outline-slate-200/75`}
            >
              <div className='flex items-center gap-x-1.5 text-sm text-slate-50'>
                <FileUploadIcon />
                Select File
              </div>
              <input
                id='file'
                type='file'
                className='hidden'
                disabled={isSubmitting}
                {...rest}
                ref={(e) => {
                  ref(e);
                  inputEl.current = e;
                }}
              />
            </label>
            <button
              aria-label='Uploads a document from filesystem'
              type='submit'
              disabled={isSubmitting}
              className={`${isValid ? 'bg-green-600 hover:bg-green-500' : 'bg-orange-600 hover:bg-orange-500'} focus-visible:outline-3  rounded p-2.5 text-sm text-slate-50 transition-all duration-200 focus-within:outline-slate-200/75 focus-visible:outline disabled:cursor-not-allowed disabled:bg-slate-250`}
            >
              Upload
            </button>
          </div>
          <div className='mt-1.5 text-[0.8125rem] text-slate-150/70'>
            {isSubmitting ? (
              <div className='flex items-center gap-x-1.5'>
                <Spinner size='sm' />
                Uploading file
              </div>
            ) : (
              `File: ${file && file[0]?.name ? file[0].name : 'None selected'}`
            )}
          </div>
        </form>
        <button
          aria-label='Opens create modal'
          onClick={() => {
            setModalType('create');
            toggleModal();
          }}
          className={`${documents.length ? 'mb-7' : ''} focus-visible:outline-3 flex items-center justify-center gap-x-1.5 rounded bg-orange-600 p-[0.625rem] text-slate-50 transition-all duration-200 hover:bg-orange-500 focus-visible:outline focus-visible:outline-slate-200/75`}
        >
          <AddIcon /> New Document
        </button>
      </div>
      {documents.length ? (
        <ul
          role='list'
          className='flex h-full max-h-full flex-col gap-y-3 overflow-y-auto scrollbar-thin scrollbar-track-slate-150 scrollbar-thumb-slate-250 scrollbar-track-rounded-full scrollbar-thumb-rounded-full dark:scrollbar-track-slate-250 dark:scrollbar-thumb-slate-100'
        >
          {documents
            // sort documents in desc order
            .sort(
              (prev, cur) =>
                new Date(cur.updatedAt).valueOf() -
                new Date(prev.updatedAt).valueOf()
            )
            .map((document) => (
              <li
                tabIndex={0}
                key={document._id}
                onClick={() => onDocumentClick(document._id)}
                onKeyDown={(e) => onFocusedDocumentClick(e, document._id)}
                className={`${document._id === id ? `border-slate-200/25 bg-slate-350` : 'border-transparent'} flex cursor-pointer items-center gap-x-4 rounded-md border p-1 transition-all duration-200 hover:bg-slate-350 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-200/60`}
              >
                <svg className='ml-3 h-4 w-4 shrink-0 fill-slate-50'>
                  <use xlinkHref={`${markdown}#icon-document`}></use>
                </svg>
                <div className='overflow-hidden'>
                  <span
                    className={`${document._id === id ? 'text-slate-200' : 'text-slate-250'} block text-[0.8125rem]  transition-all duration-200`}
                  >
                    {formatDate(document.updatedAt)}
                  </span>
                  <span className='block w-full truncate text-[0.9375rem] text-slate-50'>
                    {document.fileName}
                  </span>
                </div>
                <button
                  onClick={(event) => onDownload(event, document._id)}
                  aria-label='Downloads the document'
                  className='ml-auto flex-shrink-0 rounded-full border border-transparent text-slate-150 transition-all duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200/65'
                >
                  <FileDownloadIcon
                    sx={{
                      '&:hover': {
                        fill: '#E46643',
                      },
                    }}
                  />
                </button>
              </li>
            ))}
        </ul>
      ) : (
        <p className='mt-5 text-sm text-slate-200'>
          You do not have any documents currently.
        </p>
      )}
      <div className='mb-7 mt-auto flex justify-between pt-5'>
        <Switch isDarkTheme={isDarkTheme} setDarkTheme={setDarkTheme} />
        <Link
          aria-label='Goes to Settings page'
          to='/settings'
          className='rounded border-2 border-transparent bg-slate-350 p-2 text-slate-50 transition-all duration-200 hover:bg-slate-300/80 focus-visible:border-slate-250 focus-visible:bg-slate-300/60'
        >
          <SettingsIcon />
        </Link>
      </div>
      <button
        onClick={onLogOut}
        className='focus-visible:outline-3 rounded bg-orange-600 p-[0.625rem] text-slate-50 transition-all duration-200 hover:bg-orange-500 focus-visible:outline focus-visible:outline-slate-200/75'
      >
        Log Out
      </button>
    </aside>
  );
};

export default Aside;
