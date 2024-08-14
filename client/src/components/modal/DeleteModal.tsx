import { useState } from 'react';
import toast from 'react-hot-toast';
import MarkdownModel from '../../models/markdown';
import * as markdownAPI from '../../services/markdownAPI';

interface DeleteModalProps {
  toggleModal: () => void;
  id: string;
  documents: MarkdownModel[];
  setDocuments: React.Dispatch<React.SetStateAction<MarkdownModel[]>>;
  setCurrentDocumentId: React.Dispatch<React.SetStateAction<string>>;
}

const DeleteModal = ({
  toggleModal,
  id,
  documents,
  setDocuments,
  setCurrentDocumentId,
}: DeleteModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDocument = documents.find(
    (doc) => doc._id === id,
  ) as MarkdownModel;

  const onBtnClick = async () => {
    setIsSubmitting(true);
    try {
      // delete current document
      await markdownAPI.deleteDocument(id);

      const updatedDocuments = documents.filter((doc) => doc._id !== id);

      // update documents
      setDocuments(updatedDocuments);

      // if the document deleted was the last
      if (!updatedDocuments.length) {
        setCurrentDocumentId('');
        localStorage.setItem('currentViewedDocumentId', '');
      } else {
        // set current viewed document Id to latest document
        const updatedId = updatedDocuments.sort(
          (prev, cur) =>
            new Date(cur.updatedAt).valueOf() -
            new Date(prev.updatedAt).valueOf(),
        )[0]._id;
        setCurrentDocumentId(updatedId);
        localStorage.setItem(
          'currentViewedDocumentId',
          JSON.stringify(updatedId),
        );
      }
      toast.success(
        `Successfully deleted document ${currentDocument.fileName}`,
      );
    } catch (error) {
      toast.error((error as Error).message, { id: 'server-error' });
    } finally {
      toggleModal();
    }
  };

  return (
    <div className="flex w-[18.75rem] max-w-full flex-col gap-y-6 p-6 font-slab">
      <h6 className="text-xl font-medium tracking-wide text-slate-350 dark:text-slate-50">
        Delete this document?
      </h6>
      <p className="text-[0.9375rem] leading-[1.75rem] text-slate-250 dark:text-slate-200">
        Are you sure you want to delete the{' '}
        <span className="text-base font-bold">
          ‘{currentDocument?.fileName}’
        </span>{' '}
        document and its contents? This action cannot be reversed.
      </p>
      <button
        disabled={isSubmitting}
        onClick={onBtnClick}
        className="focus-visible:outline-3 rounded bg-orange-600 p-3 text-slate-50 transition-all duration-200 hover:bg-orange-500 focus-visible:outline focus-visible:outline-slate-350/55 disabled:cursor-not-allowed disabled:bg-slate-250 dark:focus-visible:outline-slate-200/75"
      >
        {isSubmitting ? 'Deleting document...' : 'Confirm & Delete'}
      </button>
    </div>
  );
};

export default DeleteModal;
