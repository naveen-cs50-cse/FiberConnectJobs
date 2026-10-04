import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useState } from 'react';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  workCategory: z.string().min(2, 'Category is required'),
  location: z.string().min(2, 'Location is required'),

  compensationModel: z.enum(['HOURLY', 'FIXED']),
  compensationAmount: z.number().min(1, 'Amount is required'),
  workersNeeded: z.number().min(1).default(1),
  startDate: z.string().min(1, 'Start date is required'),
});

export default function CreateJob() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      compensationModel: 'FIXED',
      workersNeeded: 1
    }
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      
      let latitude = undefined;
      let longitude = undefined;

      try {
        const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(data.location)}.json?access_token=${mapboxToken}`);
        const geoData = await res.json();
        if (geoData.features && geoData.features.length > 0) {
          longitude = geoData.features[0].center[0];
          latitude = geoData.features[0].center[1];
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      }

      await apiClient.post('/jobs', {
        ...data,
        latitude,
        longitude,
        startDate: new Date(data.startDate).toISOString()
      });
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || 'Failed to create job. Make sure you have created an organization first.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Create New Job Posting</h1>
      
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 border border-gray-200">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3"
              placeholder="e.g. Senior Fiber Splicer"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3"
              placeholder="Describe the job responsibilities, requirements, and environment..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Work Category</label>
              <input
                type="text"
                {...register('workCategory')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3"
                placeholder="e.g. Splicing, Testing, Installation"
              />
              {errors.workCategory && <p className="mt-1 text-sm text-red-600">{errors.workCategory.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                {...register('location')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3"
                placeholder="City, State or Site Address"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700">Compensation Model</label>
              <select
                {...register('compensationModel')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3 bg-white"
              >
                <option value="HOURLY">Hourly</option>
                <option value="FIXED">Fixed Price</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
              <input
                type="number"
                {...register('compensationAmount', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3"
              />
              {errors.compensationAmount && <p className="mt-1 text-sm text-red-600">{errors.compensationAmount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                {...register('startDate')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3"
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Workers Needed</label>
              <input
                type="number"
                {...register('workersNeeded', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3"
              />
              {errors.workersNeeded && <p className="mt-1 text-sm text-red-600">{errors.workersNeeded.message}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard/hirer')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
