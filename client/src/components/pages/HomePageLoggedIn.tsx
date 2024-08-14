import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import toast from 'react-hot-toast';
import Aside from '../ui/Aside';
import Editor from '../ui/Editor';
import Header from '../ui/Header';
import Preview from '../ui/Preview';
import Modal from '../modal/Modal';
import { type ModalTypes } from '../modal/ModalContentFactory';
import MarkdownModel from '../../models/markdown';
import * as markdownAPI from '../../services/markdownAPI';

interface HomePageLoggedInProps {
  isDarkTheme: boolean;
  setDarkTheme: React.Dispatch<React.SetStateAction<boolean>>;
}

const HomePageLoggedIn = ({
  isDarkTheme,
  setDarkTheme,
}: HomePageLoggedInProps) => {
  const isTabletViewport = useMediaQuery({ query: '(min-width: 48em)' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalTypes>('create');
  const [showAside, setShowAside] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [documents, setDocuments] = useState<MarkdownModel[]>([]);
  const [currentViewedDocumentId, setCurrentViewedDocumentId] =
    useState<string>(() => {
      const id: string | null = localStorage.getItem('currentViewedDocumentId');
      return id ? JSON.parse(id) : '';
    });

  const toggleModal = () => setShowModal((mode) => !mode);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const documents = await markdownAPI.retrieveDocuments();

        // check if there are documents (AND)
        // document id is invalid (OR)
        // there is no document id
        if (
          documents.length &&
          (!currentViewedDocumentId ||
            !documents.some(
              (document) => document._id === currentViewedDocumentId
            ))
        ) {
          documents.sort(
            (prev, cur) =>
              new Date(cur.updatedAt).valueOf() -
              new Date(prev.updatedAt).valueOf()
          );

          // set current document id and save to local storage
          localStorage.setItem(
            'currentViewedDocumentId',
            JSON.stringify(documents[0]._id)
          );
          setCurrentViewedDocumentId(documents[0]._id);
        }

        // sets newly fetched documents
        setDocuments(documents);
      } catch (error) {
        toast.error((error as Error).message, { id: 'server-error' });
      }
    }
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Aside
        isDarkTheme={isDarkTheme}
        setDarkTheme={setDarkTheme}
        showAside={showAside}
        setShowAside={setShowAside}
        toggleModal={toggleModal}
        setModalType={setModalType}
        id={currentViewedDocumentId}
        documents={documents}
        setDocuments={setDocuments}
        setCurrentDocumentId={setCurrentViewedDocumentId}
      />
      <div
        className={`${showAside ? 'translate-x-[15.625rem]' : 'translate-x-0'} flex h-full flex-col transition-all duration-500 scrollbar scrollbar-track-slate-150 scrollbar-thumb-slate-250 scrollbar-track-rounded-full scrollbar-thumb-rounded-full dark:scrollbar-track-slate-250 dark:scrollbar-thumb-slate-100`}
      >
        <Header
          showAside={showAside}
          setShowAside={setShowAside}
          toggleModal={toggleModal}
          setModalType={setModalType}
          id={currentViewedDocumentId}
          documents={documents}
          setDocuments={setDocuments}
        />
        <main
          className={`${
            !documents.length
              ? ''
              : !previewMode && isTabletViewport
                ? 'grid-cols-2'
                : ''
          } grid h-full dark:bg-slate-500`}
        >
          {documents.length ? (
            isTabletViewport ? (
              // layout to render for tablet and desktop
              <>
                {!previewMode && (
                  <Editor
                    id={currentViewedDocumentId}
                    documents={documents}
                    setDocuments={setDocuments}
                  />
                )}
                <Preview
                  isDarkTheme={isDarkTheme}
                  previewMode={previewMode}
                  setPreviewMode={setPreviewMode}
                  id={currentViewedDocumentId}
                  documents={documents}
                />
              </>
            ) : (
              // layout to render for mobile
              <>
                {previewMode ? (
                  <Preview
                    isDarkTheme={isDarkTheme}
                    previewMode={previewMode}
                    setPreviewMode={setPreviewMode}
                    isMobile
                    id={currentViewedDocumentId}
                    documents={documents}
                  />
                ) : (
                  <Editor
                    isDarkTheme
                    previewMode={previewMode}
                    setPreviewMode={setPreviewMode}
                    isMobile
                    id={currentViewedDocumentId}
                    documents={documents}
                    setDocuments={setDocuments}
                  />
                )}
              </>
            )
          ) : (
            // renders when there are no documents
            <div className='bg-slate-100 font-roboto transition-all duration-300 dark:bg-slate-500'>
              <p className='mx-4 flex h-full items-center justify-center text-center text-2xl font-medium tracking-wide text-slate-350 dark:text-slate-150'>
                Create or upload a document to begin writing!
              </p>
            </div>
          )}
        </main>
      </div>
      <Modal
        isDarkTheme={isDarkTheme}
        showModal={showModal}
        modalType={modalType}
        toggleModal={toggleModal}
        id={currentViewedDocumentId}
        documents={documents}
        setDocuments={setDocuments}
        setCurrentDocumentId={setCurrentViewedDocumentId}
      />
    </>
  );
};

export default HomePageLoggedIn;
