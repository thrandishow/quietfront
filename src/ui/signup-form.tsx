"use client";

export function SignUpForm() {
  return (
    <form
      action="http://backend-url-endpoint/"
      method="POST"
      className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md border border-blue-100"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        Sign Up
      </h2>

      <div className="mb-5">
        <label className="block text-sm font-medium text-blue-800 mb-1">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="username"
          placeholder="username"
          required
          className="w-full px-4 py-2.5 text-blue-900 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-blue-800 mb-1"
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="••••••••"
          required
          className="w-full px-4 py-2.5 text-blue-900 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Sign Up
      </button>
    </form>
  );
}
