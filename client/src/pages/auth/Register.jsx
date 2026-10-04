import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Building2 } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['COMPANY_OWNER', 'TECHNICIAN']),
});

export default function Register() {
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'TECHNICIAN'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      setError(null);
      const res = await apiClient.post('/auth/register', data);
      login(res.data.data, res.data.data.token);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || 'Registration failed.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Join Fiber Connect
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          The premier marketplace for fiber optic professionals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-10 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-12 border border-gray-100">
          
          {/* Sliding Role Toggle */}
          <div className="mb-8 relative flex p-1 bg-gray-100 rounded-xl">
            <div 
              className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out ${
                selectedRole === 'COMPANY_OWNER' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
              }`}
            ></div>
            
            <button
              type="button"
              onClick={() => setValue('role', 'TECHNICIAN')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg z-10 transition-colors ${
                selectedRole === 'TECHNICIAN' ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Find Work
            </button>
            
            <button
              type="button"
              onClick={() => setValue('role', 'COMPANY_OWNER')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg z-10 transition-colors ${
                selectedRole === 'COMPANY_OWNER' ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Hire Talent
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2.5 px-3 transition-colors"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2.5 px-3 transition-colors"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                {...register('email')}
                type="email"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2.5 px-3 transition-colors"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2.5 px-3 transition-colors"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center items-center rounded-lg bg-primary-600 px-3 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/30 hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 transition-all"
              >
                {isSubmitting ? 'Creating account...' : `Sign up as ${selectedRole === 'TECHNICIAN' ? 'Technician' : 'Company'}`}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
