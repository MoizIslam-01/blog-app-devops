import { useAuth } from '../../contexts/AuthContext';
import { PenSquare, LogOut, User, Shield } from 'lucide-react';

type HeaderProps = {
  onSignInClick: () => void;
  onSignUpClick: () => void;
  onCreateBlogClick: () => void;
  onAdminClick: () => void;
  onHomeClick: () => void;
};

export const Header = ({
  onSignInClick,
  onSignUpClick,
  onCreateBlogClick,
  onAdminClick,
  onHomeClick
}: HeaderProps) => {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={onHomeClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <PenSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">BlogSpace</h1>
          </button>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{profile?.username}</span>
                </div>
                <button
                  onClick={onCreateBlogClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>New Post</span>
                </button>
                {profile?.is_admin && (
                  <button
                    onClick={onAdminClick}
                    className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onSignInClick}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUpClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
