import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {signInService, signUpService} from "../../services/service.js"
import { Toaster, toast as hotToast } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import "./Login.css";

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const navigate = useNavigate();

    const resetFormData = () => {
    setFormData({ email: '', password: '', name: '' });
     };

     const handleSignUp = async (event) => {
        event.preventDefault();
        if (!validateEmail(formData.email)) {
            setError("Please use a valid montycloud.com email address.");
            return;
        }
        setIsLoading(true);
        const signupData = {
            user_name: formData.name,
            user_email: formData.email,
            password: formData.password,
        };
    
        try {
            const { response, data } = await signUpService(signupData);
            if (response.ok) {
                hotToast.success("User registered successfully");
                setIsLogin(true); // Switch to login view after successful registration
                setFormData({ email: data.user_email, password: data.password, name: '' });
            } else {
                setError(data.detail);
                hotToast.error("Registration failed: " + data.detail);
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
            hotToast.error("Error registering user: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = async (event) => {
        event.preventDefault();
    
        if (!validateEmail(formData.email)) {
            setError("Please use a montycloud.com email address.");
            return;
        }
        setIsLoading(true); // Start loading
        const loginData = {
            user_email: event.target.elements.email.value,
            password: event.target.elements.password.value,
        };
    
        try {
            const { response, data } = await signInService(loginData);
            if (response.ok) {
                hotToast.success("Logged in successfully");
                console.log("Logged in ");
                onLogin(data.user_id, data.user_email, data.token);
                navigate('/');
            } else {
                setError(data.detail || "Login failed");
                hotToast.error("Login failed: " + (data.detail || "Unknown error"));
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
            hotToast.error("Error logging in: " + error.message);
        } finally {
            setIsLoading(false); // Stop loading regardless of outcome
        }
    };

    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@montycloud\.com$/;
        return regex.test(email);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        resetFormData();
        setError(null);
    };

    return (
        <main className="w-full flex">
            
            <div className="relative flex-1 hidden items-center justify-center bg-local h-screen bg-slate-950 lg:flex">
                <div className="relative z-10 w-full max-w-md flex flex-col items-left justify-center h-full">
                    <img src="https://static.wixstatic.com/media/d303d5_f9cb482301f54d619959548b896b2a55~mv2.png/v1/fill/w_320,h_262,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Image-empty-state.png" width={280} className="-mt-48" />
                    <div className="-mt-2 space-y-3">
                        <h3 className="text-white text-3xl font-bold ml-6">Employee Feedback and Recognition Portal</h3>
                        <p className="text-gray-300 ml-6">
                            A platform designed to collect constructive feedback from employees and recognize their achievements, fostering a positive work culture.
                        </p>
                    </div>
                </div>
                <div className="absolute inset-0 my-auto h-[100px]" style={{ background: "bluepurple" }}></div>
            </div>
            <div className="flex-1 flex items-center justify-center h-screen">
                <div className="w-full max-w-md space-y-8 px-4 bg-white text-gray-600 sm:px-0">
                    <div>
                        <img src="https://floatui.com/logo.svg" width={150} className="lg:hidden" />
                        <div className="mt-5 space-y-2 text-left">
                            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
                                {isLogin ? 'Log in to your account' : 'Sign up'}
                            </h3>
                            {/* <p className="font-medium text-gray-600">
                                {isLogin ? (
                                    <>
                                        Don't have an account?{' '}
                                        <a
                                            href="#"
                                            onClick={() => setIsLogin(false)}
                                            className="font-medium text-blue-500 hover:text-blue-600"
                                        >
                                            Sign Up
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <a
                                            href="#"
                                            onClick={() => setIsLogin(true)}
                                            className="font-medium text-blue-500 hover:text-blue-600"
                                        >
                                            Log in
                                        </a>
                                    </>
                                )}
                            </p> */}
                        </div>
                    </div>
                    <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="font-medium">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-blue-500 shadow-sm rounded-lg"
                                />
                            </div>
                        )}
                        <div>
                            <label className="font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-blue-500 shadow-sm rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="font-medium">Password</label>
                            <div className="relative max-w-full mt-2">
                                <button 
                                    type="button"
                                    className=" w-fulltext-gray-400 absolute right-3 inset-y-0 my-auto active:text-gray-600"
                                    onClick={() => setPasswordHidden(!isPasswordHidden)}
                                >
                                    {
                                        isPasswordHidden ? (
                                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        )
                                    }
                                </button>
                                <input
                                    type={isPasswordHidden ? "password" : "text"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full pr-11 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-blue-500 shadow-sm rounded-lg"
                                />
                            </div>
                        </div>
                        <button className="w-full px-4 py-2 text-white font-medium bg-blue-500 hover:bg-blue-600 active:bg-blue-500 rounded-lg duration-150">
                            {isLoading ? (
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                isLogin ? 'Sign in' : 'Create account'
                            )}
                        </button>
                        {error && <p className="error text-red-500">{error}</p>}
                        <p className="font-medium text-gray-600">
                                {isLogin ? (
                                    <>
                                        Don't have an account?{' '}
                                        <a
                                            href="#"
                                            onClick={toggleAuthMode}
                                            className="font-medium text-blue-500 hover:text-blue-600"
                                        >
                                            Sign Up
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <a
                                            href="#"
                                            onClick={toggleAuthMode}
                                            className="font-medium text-blue-500 hover:text-blue-600"
                                        >
                                            Log in
                                        </a>
                                    </>
                                )}
                            </p> 
                         
                    </form>
                </div>
            </div>
        <Toaster position ="top-right"/>
        </main>
    );
}
