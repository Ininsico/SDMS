import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProfessionalLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!formData.email || !formData.password) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const result = await response.json();

            if (result.success) {
                console.log('Login successful:', result);
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('userRole', result.data.user.role);
                localStorage.setItem('userName', result.data.user.name);
                localStorage.setItem('userId', result.data.user.id);

                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                console.error('Login failed:', result.message);
                alert(`Login failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Error during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-blue-200">Sign in to your account to continue</p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-blue-900/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-700 border border-blue-800/50 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-blue-100">
                                    Password
                                </label>
                                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-700 border border-blue-800/50 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 text-blue-600 bg-gray-700 border-blue-800 rounded focus:ring-blue-500"
                                disabled={loading}
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-blue-100">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-blue-900/50"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-blue-200">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button 
                                type="button"
                                disabled={loading}
                                className="w-full inline-flex justify-center py-2 px-4 border border-blue-800/50 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-blue-100 hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                            >
                                <span>Google</span>
                            </button>
                            <button 
                                type="button"
                                disabled={loading}
                                className="w-full inline-flex justify-center py-2 px-4 border border-blue-800/50 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-blue-100 hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                            >
                                <span>GitHub</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-blue-200">
                        Don't have an account?{' '}
                        <Link 
                            to="/signup" 
                            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalLogin;