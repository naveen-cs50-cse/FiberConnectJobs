import { useState, useEffect } from 'react';
import { FileText, Users, CheckCircle, Plus, Briefcase, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          apiClient.get('/jobs/me'),
          apiClient.get('/applications')
        ]);
        setJobs(jobsRes.data.data);
        setApplications(appsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const activeJobs = jobs.filter(j => j.status === 'PUBLISHED').length;
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
  const newApps = applications.filter(a => a.status === 'SUBMITTED').length;

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Company Overview</h1>
        <Link 
          to="/dashboard/hirer/jobs/new"
          className="inline-flex items-center gap-2 bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{activeJobs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New Applications</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{newApps}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Jobs</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{completedJobs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Applicants Section */}
        <div className="bg-white shadow sm:rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Applicants</h2>
          </div>
          <div>
            {applications.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No applications received yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {applications.slice(0, 5).map((app) => (
                  <li key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between">
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {app.technicianProfile?.user?.firstName?.[0] || 'U'}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {app.technicianProfile?.user?.firstName} {app.technicianProfile?.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Briefcase className="w-3 h-3 mr-1" />
                            Applied for: {app.job?.title}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {app.technicianProfile?.user?.email}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Jobs Section */}
        <div className="bg-white shadow sm:rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900">My Recent Jobs</h2>
          </div>
          <div>
            {jobs.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">You haven't posted any jobs yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {jobs.slice(0, 5).map((job) => (
                  <li key={job.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{job.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {job.status}
                        </p>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!window.confirm('Delete this job?')) return;
                          try {
                            await apiClient.delete(`/jobs/${job.id}`);
                            setJobs(prev => prev.filter(j => j.id !== job.id));
                          } catch (err) {
                            alert(err.response?.data?.message || 'Failed to delete job');
                          }
                        }}
                        className="text-sm text-white bg-red-600 rounded px-2 py-1 hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>{job.location}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
