import { Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import signup from '../utils/signup';

const Signup = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A1A] text-white px-4">
      <div className="bg-gray-900/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#1C2233]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-sm text-gray-400 mt-2">Join PromptForge to share & collect AI prompts</p>
        </div>

        <form
          onSubmit={(e) => signup(e, setIsLoggedIn, navigate)}
          className="space-y-4"
        >
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1.5 block">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="e.g. prompt_wizard"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#1C2233] text-white border border-[#2E3A59] focus:outline-none focus:border-[#4F7FFF] transition"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1.5 block">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#1C2233] text-white border border-[#2E3A59] focus:outline-none focus:border-[#4F7FFF] transition"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1.5 block">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              minLength={6}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#1C2233] text-white border border-[#2E3A59] focus:outline-none focus:border-[#4F7FFF] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4F7FFF] hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default Signup;
