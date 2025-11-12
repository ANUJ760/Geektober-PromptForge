import { Link } from "react-router-dom";
import signup from "../utils/signup";

const Signup = ({ setIsLoggedIn }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A1A] text-white">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-lg w-96 border border-[#1C2233]">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>

        <form
          onSubmit={(e) => signup(e, setIsLoggedIn)}
          className="space-y-4"
        >
          <div>
            <label className="text-sm text-gray-400">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              className="w-full px-4 py-2 rounded-lg bg-[#1C2233] text-white border border-[#2E3A59] focus:outline-none focus:border-[#4F7FFF]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full px-4 py-2 rounded-lg bg-[#1C2233] text-white border border-[#2E3A59] focus:outline-none focus:border-[#4F7FFF]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full px-4 py-2 rounded-lg bg-[#1C2233] text-white border border-[#2E3A59] focus:outline-none focus:border-[#4F7FFF]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4F7FFF] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
