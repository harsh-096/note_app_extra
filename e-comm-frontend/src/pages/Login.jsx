import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Professional SVG Icons
const Icons = {
  Logo: () => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.5 1.5H3a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5h14a1.5 1.5 0 001.5-1.5V11" />
    </svg>
  )
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
            <Icons.Logo />
          </div>
          <h1 className="text-2xl font-semibold text-white">SignHub</h1>
          <p className="text-gray-500 text-sm mt-1">Signage Solutions</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-base font-medium text-white mb-5">Sign in to your account</h2>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-3 py-2 rounded-lg mb-4 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-500"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-600 text-gray-900 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center text-gray-500 text-xs">
            <p>Demo: admin / password | user / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
