import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';
import { SignIn } from './components/Auth/SignIn';
import { SignUp } from './components/Auth/SignUp';
import { CreateBlog } from './components/Blog/CreateBlog';
import { BlogList } from './components/Blog/BlogList';
import { BlogDetail } from './components/Blog/BlogDetail';
import { AdminPanel } from './components/Admin/AdminPanel';

function App() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header
          onSignInClick={() => setShowSignIn(true)}
          onSignUpClick={() => setShowSignUp(true)}
          onCreateBlogClick={() => setShowCreateBlog(true)}
          onAdminClick={() => setShowAdminPanel(true)}
          onHomeClick={() => setSelectedBlogId(null)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover Stories</h2>
            <p className="text-gray-600">Explore insightful articles from our community of writers</p>
          </div>
          <BlogList key={refreshKey} onBlogClick={setSelectedBlogId} />
        </main>

        {showSignIn && (
          <SignIn
            onClose={() => setShowSignIn(false)}
            onSwitchToSignUp={() => {
              setShowSignIn(false);
              setShowSignUp(true);
            }}
          />
        )}

        {showSignUp && (
          <SignUp
            onClose={() => setShowSignUp(false)}
            onSwitchToSignIn={() => {
              setShowSignUp(false);
              setShowSignIn(true);
            }}
          />
        )}

        {showCreateBlog && (
          <CreateBlog
            onClose={() => setShowCreateBlog(false)}
            onSuccess={handleRefresh}
          />
        )}

        {selectedBlogId && (
          <BlogDetail
            blogId={selectedBlogId}
            onClose={() => setSelectedBlogId(null)}
            onRefresh={handleRefresh}
          />
        )}

        {showAdminPanel && (
          <AdminPanel
            onClose={() => setShowAdminPanel(false)}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
