import { useState, useEffect } from 'react';
import { Users, Mail, Briefcase, Calendar, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

export default function HirerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await apiClient.get('/applications');
        setApplications(res.data.data);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">All Applicants</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading applicants...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm">
          <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No applicants yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't received any applications for your jobs yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-white shadow-sm border border-indigo-100 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {app.technicianProfile?.user?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {app.technicianProfile?.user?.firstName} {app.technicianProfile?.user?.lastName}
                    </h2>
                    <div className="flex items-center mt-1 text-sm text-indigo-600 font-medium">
                      <Briefcase className="w-4 h-4 mr-1 text-indigo-400" />
                      Applied for: {app.job?.title}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                    {app.status}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-1.5 text-gray-400" />
                  {app.technicianProfile?.user?.email}
                </div>
                
                <Link
                  to={`/dashboard/messages?user=${app.technicianProfile?.user?.id}`}
                  className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message Applicant
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
