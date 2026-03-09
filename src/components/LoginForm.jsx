import "./LoginForm.css"
import React from 'react'
import { useState } from 'react'

import { MdEmail } from "react-icons/md";
import { IoMdLock } from "react-icons/io";
import { FaGoogle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { FaUser } from "react-icons/fa";

export const LoginForm = ({ isOpen, onClose }) => {

    const [view, setView] = useState('login');

    if (!isOpen) return null;

    const loginStyle = {
        transform: view === 'login' ? 'translateX(0)' : 'translateX(-500px)',
        transition: 'transform 0.3s ease'
    };

    const registrationStyle = {
        transform: view === 'signup' ? 'translateX(0)' : 'translateX(500px)',
        transition: 'transform 0.3s ease',
        position: 'absolute',
        top: 0
    };


    return (
        <div class="modal-container open">
            <div class="modal-content">
                <MdCancel class="cancel" onClick={onClose} />

                <form className="login" style={loginStyle}>
                    <h1>Login</h1>

                    <div class="form-control">
                        <label for="email"><MdEmail /> Email</label>
                        <input type="email" id="email" placeholder="Enter your email" />
                    </div>

                    <div class="form-control">
                        <label for="password"><IoMdLock /> Password</label>
                        <input type="password" id="password" placeholder="Enter your password" />
                    </div>
                    <div class="form-control-others">
                        <button>Login</button>
                    </div>
                    <div class="form-control-others">
                        <p> -- Or sign in with -- </p>
                        <button><FaGoogle /> Google</button>
                    </div>
                    <div class="form-control-others">
                        <label>
                            Don't have an account? <a href="#" onClick={() => setView('signup')}>Sign up now</a>
                        </label>
                    </div>
                </form>

                <form className="registration" style={registrationStyle}>
                    <h1>Create Account</h1>

                    <div class="horiz-form">
                        <div class="form-control">
                            <label for="first-name"><FaUser /> First Name</label>
                            <input type="first-name" id="first-name" placeholder="Enter your first name" />
                        </div>
                        <div class="form-control">
                            <label for="last-name"><FaUser /> Last Name</label>
                            <input type="last-name" id="last-name" placeholder="Enter your last name" />
                        </div>
                    </div>

                    <div class="form-control2">
                        <label for="email"><MdEmail /> Email</label>
                        <input type="email" id="email" placeholder="Enter your email" />
                    </div>

                    <div class="form-control2">
                        <label for="password"><IoMdLock /> Password</label>
                        <input type="password" id="password" placeholder="Enter your password" />
                    </div>
                    <div class="form-control2">
                        <label for="password"><IoMdLock /> Confirm Password</label>
                        <input type="password" id="password" placeholder="Confirm your password" />
                    </div>

                    <div class="form-control-others">
                        <button>Create Account</button>
                    </div>
                    <div class="form-control-others">
                        <p> -- Or sign in with -- </p>
                        <button><FaGoogle /> Google</button>
                    </div>
                    <div class="form-control-others">
                        <label>
                            Already have an account? <a href="#" onClick={() => setView('login')}>Log in</a>
                        </label>
                    </div>
                </form>
            </div>
        </div>
    )
}