import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = ({ onLoginSuccess, onLoginFailure }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">TeamTrack</h1>
          <p className="text-gray-600 mt-2">
            Build habits together, achieve more
          </p>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4 text-center">
            Sign in to track your team's habits and progress together
          </p>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={onLoginSuccess}
              onError={onLoginFailure}
              useOneTap
              theme="filled_blue"
              shape="rectangular"
              text="signin_with"
              size="large"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default LoginPage;