import { useForm, SubmitHandler, RegisterOptions } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputField from '../ui/InputField';
import ErrorMsg from '../ui/ErrorMsg';
import MarkdownModel from '../../models/markdown';
import { ConflictError } from '../../utils/httpErrors';
import * as markdownAPI from '../../services/markdownAPI';

interface ModalProps {
  isDarkTheme: boolean;
  modalType: 'create' | 'rename';
  toggleModal: () => void;
  id: string;
  documents: MarkdownModel[];
  setDocuments: React.Dispatch<React.SetStateAction<MarkdownModel[]>>;
  setCurrentDocumentId: React.Dispatch<React.SetStateAction<string>>;
}

interface FormProps {
  fileName: string;
}

const CreateRenameModal = ({
  isDarkTheme,
  modalType,
  toggleModal,
  id,
  documents,
  setDocuments,
  setCurrentDocumentId,
}: ModalProps) => {
  const currentDocument = documents.find(
    (doc) => doc._id === id
  ) as MarkdownModel;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormProps>({
    defaultValues: {
      fileName: modalType === 'create' ? '' : currentDocument?.fileName,
    },
  });

  const validationOptions: RegisterOptions<FormProps> = {
    required: 'Document must have a name',
    pattern: {
      value: /^[^\s.][\w]*\.md$/,
      message: 'Invalid document format',
    },
  };

  // custom validation when creating documents
  const createValidation = (fileName: string) => {
    // early return if documents are empty
    if (!documents.length) return;
    const document = documents.find((doc) => doc.fileName === fileName);
    return !document || 'There is already a document with this name';
  };

  // custom validation when renaming documents
  const renameValidation = (fileName: string) => {
    if (!documents.length) return;
    const document = documents.find(
      (doc) => doc.fileName === fileName && doc._id !== id
    );
    return !document || 'There is already a document with this name';
  };

  const onSubmit: SubmitHandler<FormProps> = async (formData) => {
    switch (modalType) {
      case 'create': {
        try {
          // create new document
          const document = await markdownAPI.createDocument(formData);

          // update documents
          setDocuments((documents) => [...documents, document]);

          // save current viewed document Id to localstorage if documents are initially empty
          if (!documents.length) {
            localStorage.setItem(
              'currentViewedDocumentId',
              JSON.stringify(document._id)
            );
          }

          setCurrentDocumentId(document._id);
          toast.success('Successfully created document!');
        } catch (error) {
          if (error instanceof ConflictError) {
            toast.error(error.errorMsgs as string);
          } else {
            toast.error((error as Error).message, { id: 'server-error' });
          }
        } finally {
          // close modal
          toggleModal();
        }
        break;
      }

      case 'rename': {
        const { fileName } = formData;

        // prevent calls to API if user does not rename file name
        if (fileName === currentDocument.fileName) return;

        try {
          // update document name
          const document = await markdownAPI.renameDocument({
            ...formData,
            _id: id,
          });

          // update documents
          setDocuments((documents) =>
            documents.map((doc) => (doc._id === document._id ? document : doc))
          );
          toast.success('Successfully renamed document!');
        } catch (error) {
          toast.error((error as Error).message, { id: 'server-error' });
        } finally {
          toggleModal();
        }
        break;
      }

      default:
        throw new Error('Unknown modal type');
    }
  };

  return (
    <form
      className='flex h-full w-[18.75rem] max-w-full flex-col gap-y-5 p-6 font-slab'
      onSubmit={handleSubmit(onSubmit)}
      autoComplete='off'
    >
      <h6 className='text-xl font-medium tracking-wide text-slate-350 dark:text-slate-50'>
        {modalType === 'create' ? 'Create a new document' : 'Rename document'}
      </h6>
      {errors?.fileName?.message && <ErrorMsg msg={errors.fileName.message} />}
      <InputField
        isDarkTheme={isDarkTheme}
        fullWidth
        type='text'
        label='Document Name'
        error={!(errors.fileName === undefined)}
        register={register}
        registerName='fileName'
        validationOptions={{
          ...validationOptions,
          validate:
            modalType === 'create' ? createValidation : renameValidation,
        }}
      />
      <button
        disabled={isSubmitting}
        className='focus-visible:outline-3 rounded bg-orange-600 p-3 text-slate-50 transition-all duration-200 hover:bg-orange-500 focus-visible:outline focus-visible:outline-slate-350/55 disabled:cursor-not-allowed disabled:bg-slate-250 dark:focus-visible:outline-slate-200/75'
      >
        {modalType === 'create'
          ? isSubmitting
            ? 'Creating document...'
            : 'Create'
          : isSubmitting
            ? 'Renaming document...'
            : 'Rename'}
      </button>
    </form>
  );
};

export default CreateRenameModal;
