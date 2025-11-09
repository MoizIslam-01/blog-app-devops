import { Home, LogOut, User, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavbarProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-2xl font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              <Home className="w-8 h-8" />
              <span>Staybnb</span>
            </button>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-gray-700 hover:text-rose-600 hover:bg-gray-50'
                }`}
              >
                Browse Listings
              </button>

              {user && (
                <>
                  <button
                    onClick={() => onNavigate('add-property')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                      currentPage === 'add-property'
                        ? 'text-rose-600 bg-rose-50'
                        : 'text-gray-700 hover:text-rose-600 hover:bg-gray-50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Property
                  </button>

                  <button
                    onClick={() => onNavigate('my-properties')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 'my-properties'
                        ? 'text-rose-600 bg-rose-50'
                        : 'text-gray-700 hover:text-rose-600 hover:bg-gray-50'
                    }`}
                  >
                    My Properties
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {profile?.full_name || profile?.email}
                  </span>
                  {profile?.role === 'admin' && (
                    <span className="px-2 py-1 text-xs font-semibold text-white bg-rose-600 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('signin')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
