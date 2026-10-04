import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Bell, LayoutDashboard, Search, Briefcase, User, PlusCircle, MessageSquare, FileText, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isTechnician = (user?.platformRole || user?.role) === 'TECHNICIAN';

  // Dynamic theme colors based on account type
  const theme = isTechnician 
    ? {
        sidebarBg: 'bg-emerald-700',
        activeLink: 'bg-emerald-50 text-emerald-700',
        iconActive: 'text-emerald-600',
        textHighlight: 'text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        avatarBg: 'from-emerald-600 to-emerald-400'
      }
    : {
        sidebarBg: 'bg-indigo-800', // Different distinct color for hiring managers
        activeLink: 'bg-indigo-50 text-indigo-700',
        iconActive: 'text-indigo-600',
        textHighlight: 'text-indigo-600',
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        avatarBg: 'from-indigo-700 to-indigo-500'
      };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const fetchUnreadAndNotifications = async () => {
      try {
        const [msgRes, notifRes] = await Promise.all([
          apiClient.get('/messages/unread'),
          apiClient.get('/notifications')
        ]);
        setUnreadMessages(msgRes.data.count);
        setNotifications(notifRes.data.data);
      } catch (err) {
        // ignore
      }
    };
    
    fetchUnreadAndNotifications();
    const interval = setInterval(fetchUnreadAndNotifications, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const handleMarkNotificationsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const technicianLinks = [
    { name: 'Dashboard', path: '/dashboard/seeker', icon: LayoutDashboard },
    { name: 'Find Jobs', path: '/dashboard/seeker/jobs', icon: Search },
    { name: 'My Applications', path: '/dashboard/seeker/applications', icon: FileText },
    { name: 'My Assignments', path: '/dashboard/seeker/assignments', icon: Briefcase },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare, badge: unreadMessages },
    { name: 'My Profile', path: '/dashboard/profile', icon: User },
  ];

  const companyLinks = [
    { name: 'Company Dashboard', path: '/dashboard/hirer', icon: LayoutDashboard },
    { name: 'Post a New Job', path: '/dashboard/hirer/jobs/new', icon: PlusCircle },
    { name: 'My Job Postings', path: '/dashboard/hirer/jobs', icon: Briefcase },
    { name: 'All Applicants', path: '/dashboard/hirer/applications', icon: Users },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare, badge: unreadMessages },
    { name: 'Company Settings', path: '/dashboard/profile', icon: User },
  ];

  const links = isTechnician ? technicianLinks : companyLinks;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`w-64 border-r border-gray-200 hidden md:flex flex-col shadow-sm bg-white z-20`}>
        <div className={`h-16 flex items-center px-6 border-b border-gray-200 ${theme.sidebarBg}`}>
          <Link to="/" className="text-2xl font-bold text-white tracking-wide">
            Fiber Connect
          </Link>
        </div>
        
        {/* Account Type Identifier in Sidebar */}
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Account Type</p>
          <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${theme.badge}`}>
            {isTechnician ? 'JOB SEEKER (TECHNICIAN)' : 'HIRING MANAGER (COMPANY)'}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path === '/dashboard' && location.pathname === '/dashboard/');
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? theme.activeLink 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? theme.iconActive : 'text-gray-400'}`} />
                <span className="flex-1">{link.name}</span>
                {link.badge > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm ml-2">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10 relative">
          <div className="flex items-center md:hidden">
            <span className={`text-xl font-bold ${theme.textHighlight}`}>Fiber Connect</span>
          </div>
          
          <div className="flex items-center justify-end flex-1 space-x-4">
            
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  if (!isNotificationsOpen && unreadNotificationsCount > 0) {
                    handleMarkNotificationsRead();
                  }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors relative p-1"
              >
                <Bell className="w-6 h-6" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 flex flex-col overflow-hidden max-h-96">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        You have no notifications.
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                          <li key={notif.id} className={`p-4 hover:bg-gray-50 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}>
                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{notif.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex items-center space-x-4 border-l border-gray-200 pl-4">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${theme.avatarBg} text-white flex items-center justify-center font-bold shadow-sm`}>
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="font-semibold text-gray-700 text-sm leading-tight">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className={`text-xs font-bold ${theme.textHighlight}`}>
                    {isTechnician ? 'Technician' : 'Company Owner'}
                  </span>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
