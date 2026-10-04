import { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

export default function TechnicianDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [assignRes, appRes] = await Promise.all([
          apiClient.get('/assignments').catch(() => ({ data: { data: [] } })),
          apiClient.get('/applications/me').catch(() => ({ data: { data: [] } }))
        ]);
        setAssignments(assignRes.data.data);
        setApplications(appRes.data.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const activeAssignments = assignments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'ACCEPTED').length;
  const totalApplications = applications.length;
  const completedJobs = assignments.filter(a => a.status === 'COMPLETED').length;

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Technician Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Assignments</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{activeAssignments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{totalApplications}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Assignments</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{completedJobs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg border border-gray-100">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h2>
          <Link to="/dashboard/seeker/jobs" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Find more work &rarr;
          </Link>
        </div>
        <div>
          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-sm font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't applied to any jobs.</p>
              <div className="mt-6">
                <Link
                  to="/dashboard/seeker/jobs"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Browse Available Jobs
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {applications.slice(0, 5).map((app) => (
                <li key={app.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">{app.job?.title || 'Job Application'}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {app.status || 'APPLIED'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
