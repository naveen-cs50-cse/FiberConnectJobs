import { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Users, Calendar, CheckCircle, Globe } from 'lucide-react';
import apiClient from '../../api/client';
import { Map, Marker, Popup, NavigationControl, GeolocateControl } from '@vis.gl/react-mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function FindJobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Map & distance UI state
  const [viewport, setViewport] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 5,
    width: '100%',
    height: '420px'
  });
  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          apiClient.get('/jobs'),
          apiClient.get('/applications/me')
        ]);
        
        setJobs(jobsRes.data.data.filter(j => j.status === 'PUBLISHED'));
        
        const appliedIds = new Set(appsRes.data.data.map(app => app.jobId));
        setAppliedJobIds(appliedIds);
      } catch (err) {
        console.error('Failed to fetch jobs or applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Request browser geolocation to enable distance filtering
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setViewport((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            zoom: 10
          }));
        },
        (err) => console.warn('Geolocation unavailable:', err)
      );
    }
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesText =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesText) return false;
    if (maxDistance && userLocation && job.latitude && job.longitude) {
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(job.latitude - userLocation.latitude);
      const dLon = toRad(job.longitude - userLocation.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLocation.latitude)) *
          Math.cos(toRad(job.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= Number(maxDistance);
    }
    return true;
  });

  const handleApply = async (jobId) => {
    try {
      await apiClient.post('/applications', { jobId, coverLetter: 'I am interested in this position.' });
      setAppliedJobIds(prev => new Set([...prev, jobId]));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply for job');
    }
  };

  return (
    <div className="space-y-6">
      {/* Map and controls */}
      <div className="mb-4">
        <Map
          initialViewState={viewport}
          onMove={(event) => setViewport(event.viewState)}
          mapLib={mapboxgl}
          style={{ width: '100%', height: '420px' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        >
          <GeolocateControl position="top-right" trackUserLocation={true} showAccuracyCircle={false} />
          <NavigationControl showCompass={false} position="top-right" />
          {jobs.map((job) => (
            job.latitude && job.longitude && (
              <Marker 
                key={job.id} 
                longitude={job.longitude} 
                latitude={job.latitude}
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelectedJob(job);
                }}
              >
                <div className="bg-primary-600 rounded-full w-4 h-4 border-2 border-white cursor-pointer hover:bg-primary-700 transition-colors" title={job.title} />
              </Marker>
            )
          ))}

          {selectedJob && (
            <Popup
              longitude={selectedJob.longitude}
              latitude={selectedJob.latitude}
              anchor="bottom"
              onClose={() => setSelectedJob(null)}
              closeOnClick={false}
              className="z-10 rounded-lg shadow-lg"
            >
              <div className="p-3 text-gray-900 max-w-xs">
                <h3 className="font-semibold text-lg">{selectedJob.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{selectedJob.location}</p>
                <p className="text-sm font-medium text-primary-600">${selectedJob.compensationAmount} ({selectedJob.compensationModel})</p>
                <div className="mt-3">
                  {appliedJobIds.has(selectedJob.id) ? (
                    <button 
                      disabled
                      className="w-full flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-50 cursor-not-allowed"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(selectedJob.id)}
                      className="w-full flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          )}
          {userLocation && (
            <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
              <Globe className="text-primary-500 w-4 h-4" />
            </Marker>
          )}
        </Map>
        {/* Distance filter */}
        <div className="mt-2 flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Max distance (km):</label>
          <input
            type="number"
            className="w-20 px-2 py-1 border border-gray-300 rounded"
            placeholder="Any"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
          />
        </div>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Find Jobs</h1>
        
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search jobs or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading jobs...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm">
          <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No jobs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'There are no active jobs available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-sm text-primary-600 font-medium mt-1">{job.workCategory}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {job.status}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  ${job.compensationAmount} ({job.compensationModel})
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  {job.workersNeeded} Workers Needed
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  Starts: {new Date(job.startDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="mt-6">
                {appliedJobIds.has(job.id) ? (
                  <button 
                    disabled
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-50 cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Applied
                  </button>
                ) : (
                  <button 
                    onClick={() => handleApply(job.id)}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
