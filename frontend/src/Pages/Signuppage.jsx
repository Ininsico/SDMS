import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProfessionalSignup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmpassword: '' // Changed from confirmPassword to confirmpassword
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
        if (formData.password !== formData.confirmpassword) {
            alert('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        if (!formData.name || !formData.email || !formData.password || !formData.confirmpassword) {
            alert('All fields are required');
            return;
        }

        setLoading(true);

        try {
            // Prepare data for backend (matching backend field names)
            const submitData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                confirmpassword: formData.confirmpassword // Matches backend expectation
            };

            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            const result = await response.json();

            if (result.success) {
                console.log('Signup successful:', result);
                // Save token to localStorage
                localStorage.setItem('token', result.data.token);
                // Redirect user or show success message
                alert('Account created successfully!');
                // Optionally redirect to login or dashboard
                // window.location.href = '/dashboard';
            } else {
                console.error('Signup failed:', result.message);
                alert(`Signup failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('Error during signup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-blue-200">Sign up to get started</p>
                </div>

                {/* Signup Card */}
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-blue-900/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-700 border border-blue-800/50 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your full name"
                                required
                                disabled={loading}
                            />
                        </div>

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
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-700 border border-blue-800/50 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Create a password (min. 6 characters)"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmpassword" // Changed from confirmPassword to confirmpassword
                                value={formData.confirmpassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-700 border border-blue-800/50 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Confirm your password"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Terms Agreement */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="terms"
                                className="w-4 h-4 text-blue-600 bg-gray-700 border-blue-800 rounded focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-blue-100">
                                I agree to the Terms and Conditions
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
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-blue-900/50"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-blue-200">Or sign up with</span>
                            </div>
                        </div>

                        {/* Social Signup */}
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
                        Already have an account?{' '}
                        <Link 
                            to="/login" 
                            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalSignup;