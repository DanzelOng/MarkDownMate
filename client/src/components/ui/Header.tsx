import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { type ModalTypes } from '../modal/ModalContentFactory';
import MarkdownModel from '../../models/markdown';
import markdown from '/assets/markdown.svg';
import menu from '/assets/menu.svg';
import * as markdownAPI from '../../services/markdownAPI';

interface HeaderProps {
  showAside: boolean;
  setShowAside: React.Dispatch<React.SetStateAction<boolean>>;
  toggleModal: () => void;
  setModalType: React.Dispatch<React.SetStateAction<ModalTypes>>;
  id: string;
  documents: MarkdownModel[];
  setDocuments: React.Dispatch<React.SetStateAction<MarkdownModel[]>>;
}

const Header = ({
  showAside,
  setShowAside,
  toggleModal,
  setModalType,
  id,
  documents,
  setDocuments,
}: HeaderProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAsideBar = () => setShowAside((state) => !state);

  const currentDocument: MarkdownModel | undefined = documents.find(
    (document) => document._id === id
  );

  const onSaveChanges = async () => {
    setIsSubmitting(true);
    try {
      // save document
      const document = await markdownAPI.updateDocument(
        currentDocument as MarkdownModel
      );

      // update documents
      setDocuments((documents) =>
        documents.map((doc) => (doc._id === document._id ? document : doc))
      );

      toast.success(
        `Successfully saved document ${currentDocument?.fileName}!`,
        {
          id: 'save-document',
        }
      );
    } catch (error) {
      toast.error((error as Error).message, {
        id: 'server-error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className='flex min-h-[3.5rem] bg-slate-400 md:min-h-[4.5rem]'>
      <button
        aria-controls='btn-icons'
        aria-label='Opens aside bar'
        onClick={toggleAsideBar}
        className='flex w-[3.5rem] cursor-pointer items-center justify-center bg-slate-350 transition-all duration-200 hover:bg-orange-600 focus-visible:bg-slate-300 focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-slate-200/85 md:w-[4.5rem]'
      >
        <svg
          id='btn-icons'
          aria-hidden={showAside}
          className={`${!showAside ? 'block' : 'hidden'} h-[0.875rem] w-[1.4375rem] md:h-[1.125rem] md:w-[1.875rem]`}
        >
          <use xlinkHref={`${menu}#icon-menu`}></use>
        </svg>
        <svg
          id='btn-icons'
          aria-hidden={!showAside}
          className={`${showAside ? 'block' : 'hidden'} h-[1.125rem] w-[1.4375rem] md:h-[1.375rem] md:w-[1.875rem]`}
        >
          <use xlinkHref={`${menu}#icon-close`}></use>
        </svg>
      </button>
      <div className='flex items-center'>
        <h1 className='hidden border-r border-slate-300 px-4 py-[0.5rem] font-commissioner text-[0.9375rem] uppercase tracking-[0.4em] text-slate-50 md:block'>
          <Link
            to='/'
            className='transition-all duration-200 focus-within:outline-4 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-200/70'
          >
            MarkDownMate
          </Link>
        </h1>
        <div className='flex items-center'>
          <svg className='mx-4 h-4 w-[1rem] fill-slate-50'>
            <use xlinkHref={`${markdown}#icon-document`}></use>
          </svg>
          <div className='flex font-roboto md:flex-col'>
            <h6 className='hidden text-[0.8125rem] font-thin text-slate-200 md:block'>
              Document Name
            </h6>
            <div className='flex flex-wrap items-center gap-x-2 text-slate-50'>
              <span
                className={`${documents.length ? 'max-w-[6.25rem] truncate' : ''} text-[0.9375rem] md:max-w-fit md:whitespace-normal`}
              >
                {currentDocument
                  ? currentDocument.fileName
                  : 'No available document'}
              </span>
              {currentDocument && (
                <button
                  aria-label='opens modal to rename document'
                  className='focus-visible:outline-3 cursor-pointer transition-all duration-100 focus-visible:outline focus-visible:outline-slate-200/80'
                  onClick={() => {
                    setModalType('rename');
                    toggleModal();
                  }}
                >
                  <DriveFileRenameOutlineIcon
                    className='transition-all duration-200 hover:fill-orange-600'
                    sx={{
                      width: '1.125rem',
                      height: '1.125rem',
                      fill: '#C1C4CB',
                    }}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {currentDocument && !showAside && (
        <div className='ml-auto mr-5 flex items-center gap-x-5'>
          <button
            className='focus-visible:outline-3 transition-all duration-200 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-slate-200/80'
            aria-label='opens modal to delete document'
            onClick={() => {
              setModalType('delete');
              toggleModal();
            }}
          >
            <svg className='h-5 w-[1.125rem] fill-slate-250 transition-all duration-200 hover:fill-orange-600'>
              <use xlinkHref={`${markdown}#icon-delete`}></use>
            </svg>
          </button>
          <button
            onClick={onSaveChanges}
            disabled={isSubmitting}
            aria-label='save changes to document'
            className='focus-visible:outline-3 flex items-center gap-x-2 rounded bg-orange-600 p-[0.5rem] transition-all duration-200 hover:bg-orange-500 focus-visible:outline focus-visible:outline-slate-200/75 disabled:cursor-not-allowed disabled:bg-slate-300 md:w-[9.375rem]'
          >
            <svg className='h-5 w-[1.125rem]'>
              <use xlinkHref={`${markdown}#icon-save`}></use>
            </svg>
            <span className='hidden font-roboto text-slate-50 md:flex md:items-center'>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
