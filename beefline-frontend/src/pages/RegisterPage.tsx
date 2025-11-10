import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Join Beefline</h2>
          <p className="mt-2 text-gray-600">Create your account to get started</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
