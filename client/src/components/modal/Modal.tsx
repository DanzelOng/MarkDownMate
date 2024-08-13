import MuiModal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import ModalContentFactory from './ModalContentFactory';
import MarkdownModel from '../../models/markdown';

interface ModalProps {
  isDarkTheme: boolean;
  showModal: boolean;
  modalType: 'create' | 'rename' | 'delete';
  toggleModal: () => void;
  id: string;
  documents: MarkdownModel[];
  setDocuments: React.Dispatch<React.SetStateAction<MarkdownModel[]>>;
  setCurrentDocumentId: React.Dispatch<React.SetStateAction<string>>;
}

function Modal({
  isDarkTheme,
  showModal,
  modalType,
  toggleModal,
  id,
  documents,
  setDocuments,
  setCurrentDocumentId,
}: ModalProps) {
  return (
    <MuiModal
      open={showModal}
      onClose={toggleModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: {
            backgroundColor: isDarkTheme
              ? 'rgb(124, 129, 135, 0.5)'
              : 'rgba(21, 22, 25, 0.5)',
          },
        },
      }}
    >
      <Fade in={showModal}>
        <div className='fixed right-[50%] top-[50%] translate-x-[50%] translate-y-[-50%] rounded bg-slate-50 dark:bg-slate-500'>
          {ModalContentFactory({
            isDarkTheme,
            modalType,
            toggleModal,
            id,
            documents,
            setDocuments,
            setCurrentDocumentId,
          })}
        </div>
      </Fade>
    </MuiModal>
  );
}

export default Modal;
