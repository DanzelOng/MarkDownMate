import DeleteModal from './DeleteModal';
import CreateRenameModal from './CreateRenameModal';
import MarkdownModel from '../../models/markdown';

export type ModalTypes = 'create' | 'rename' | 'delete';

interface ModalContentFactoryProps {
  isDarkTheme: boolean;
  modalType: ModalTypes;
  toggleModal: () => void;
  id: string;
  documents: MarkdownModel[];
  setDocuments: React.Dispatch<React.SetStateAction<MarkdownModel[]>>;
  setCurrentDocumentId: React.Dispatch<React.SetStateAction<string>>;
}

const ModalContentFactory = ({
  isDarkTheme,
  modalType,
  toggleModal,
  id,
  documents,
  setDocuments,
  setCurrentDocumentId,
}: ModalContentFactoryProps) => {
  switch (modalType) {
    case 'create':
    case 'rename':
      return (
        <CreateRenameModal
          isDarkTheme={isDarkTheme}
          modalType={modalType}
          toggleModal={toggleModal}
          id={id}
          documents={documents}
          setDocuments={setDocuments}
          setCurrentDocumentId={setCurrentDocumentId}
        />
      );

    case 'delete':
      return (
        <DeleteModal
          toggleModal={toggleModal}
          id={id}
          documents={documents}
          setDocuments={setDocuments}
          setCurrentDocumentId={setCurrentDocumentId}
        />
      );

    default:
      throw new Error('Unknown modal type');
  }
};

export default ModalContentFactory;
