import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import ProfileEditModal from './ProfileEditModal';

// Default profile picture as data URI to avoid external requests
const DEFAULT_PROFILE_PICTURE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='6' fill='%239ca3af'/%3E%3Cpath d='M8 32c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E";

const Profile = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show clickable avatar that opens Auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 hover:border-blue-500 transition-colors"
            title="Login or Sign up"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  if (loading || !user) {
    return (
      <div className="absolute top-4 right-4 z-10">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-4 right-4 z-10" ref={dropdownRef}>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative group cursor-pointer"
            title="Click to view profile options"
          >
            <img
              src={user.profile_picture || DEFAULT_PROFILE_PICTURE}
              alt={user.full_name || user.username || 'User'}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:border-blue-500 transition-colors"
              onError={(e) => {
                e.target.src = DEFAULT_PROFILE_PICTURE;
              }}
            />
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] py-2">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="font-semibold text-gray-800">{user.full_name || user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(true);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Edit Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <ProfileEditModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />
    </>
  );
};

export default Profile;

