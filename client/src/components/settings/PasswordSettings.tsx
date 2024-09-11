import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputField from '../ui/InputField';
import ErrorMsg from '../ui/ErrorMsg';
import { BadRequestError, ExceedRequestsError } from '../../utils/httpErrors';
import * as authAPI from '../../services/authAPI';

interface FormProps {
  passwordConfirmation: string;
  newPassword: string;
}

const UsernameSettings = () => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormProps>();

  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    try {
      await authAPI.updateCredentials(data);
      reset();
      toast.success('Password successfully updated!', { id: 'password' });
    } catch (error) {
      if (error instanceof BadRequestError) {
        Object.entries(error.errorMsgs as object).forEach((err) =>
          setError(err[0] as keyof FormProps, {
            type: 'custom',
            message: err[1],
          })
        );
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
        <h3 className='text-2xl font-medium text-slate-500'>Password</h3>
        <div className='flex flex-col gap-y-1'>
          {errors?.passwordConfirmation?.message && (
            <ErrorMsg msg={errors.passwordConfirmation.message} />
          )}
          <div className='flex-grow'>
            <InputField
              fullWidth
              type='password'
              label='Current Password'
              error={!(errors.passwordConfirmation === undefined)}
              register={register}
              registerName='passwordConfirmation'
              validationOptions={{
                required: 'Please enter your current password',
                validate: {
                  detectWhitespaces: (passwordConfirmation) =>
                    !/^\s|\s$/.test(passwordConfirmation) ||
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
        </div>
        <div className='flex flex-col gap-y-1'>
          {errors?.newPassword?.message && (
            <ErrorMsg msg={errors.newPassword.message} />
          )}
          <div className='flex-grow'>
            <InputField
              fullWidth
              type='password'
              label='New Password'
              error={!(errors.newPassword === undefined)}
              register={register}
              registerName='newPassword'
              validationOptions={{
                required: 'You did not enter a new password',
                validate: {
                  detectWhitespaces: (newPassword) =>
                    !/^\s|\s$/.test(newPassword) ||
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
        </div>
        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-orange-600 px-6 py-3 text-base text-slate-50 transition-all duration-200 hover:bg-orange-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250 disabled:cursor-not-allowed disabled:bg-slate-300'
        >
          Update Password
        </button>
      </div>
    </form>
  );
};

export default UsernameSettings;
