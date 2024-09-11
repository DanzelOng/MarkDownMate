import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { IUserCredentials } from '../../routes/Settings';
import InputField from '../ui/InputField';
import ErrorMsg from '../ui/ErrorMsg';
import {
  BadRequestError,
  ConflictError,
  ExceedRequestsError,
} from '../../utils/httpErrors';
import * as authAPI from '../../services/authAPI';

interface UsernameProps {
  username: string;
  setCredentials: React.Dispatch<React.SetStateAction<IUserCredentials>>;
}

interface FormProps {
  username: string;
}

const UsernameSettings = ({ username, setCredentials }: UsernameProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormProps>({ defaultValues: { username } });

  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    if (data.username === username) return;

    try {
      await authAPI.updateCredentials({ username: data.username });
      setCredentials((state) => ({ ...state, username: data.username }));
      toast.success('Username successfully updated!');
    } catch (error) {
      if (error instanceof ConflictError || error instanceof BadRequestError) {
        setError('username', {
          type: 'custom',
          message: error.errorMsgs as string,
        });
      } else if (error instanceof ExceedRequestsError) {
        toast.error((error as Error).message, { id: 'exceed-requests-error' });
      } else {
        toast.error((error as Error).message, { id: 'server-error' });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-6'
      autoComplete='off'
    >
      <div className='flex flex-col gap-y-5'>
        <h3 className='text-2xl font-medium text-slate-500'>Name</h3>
        <div className='space-y-4'>
          {errors?.username?.message && (
            <ErrorMsg msg={errors.username.message} />
          )}
          <div className='flex flex-wrap justify-between gap-5'>
            <div className='flex-grow'>
              <InputField
                fullWidth
                type='text'
                label='New Name'
                error={!(errors.username === undefined)}
                register={register}
                registerName='username'
                validationOptions={{
                  required: 'A name is required',
                  validate: {
                    detectWhitespaces: (username) =>
                      !/^\s|\s$/.test(username) ||
                      'No leading or trailing whitespaces',
                  },
                  minLength: {
                    value: 3,
                    message: 'Min length of 3 characters',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Max length of 50 characters',
                  },
                }}
              />
            </div>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-[9.5rem] bg-orange-600 px-6 py-3 text-base text-slate-50 transition-all duration-200 hover:bg-orange-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              Update Name
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UsernameSettings;
