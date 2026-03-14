import "./LoginForm.css"
import React, { useState } from 'react'

import { MdEmail } from "react-icons/md";
import { IoMdLock } from "react-icons/io";
import { FaGoogle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { FaUser } from "react-icons/fa";

export const LoginForm = ({ isOpen, onClose }) => {

    const [view, setView] = useState('login');

    //if (!isOpen) return null;

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
        <div className={`modal-container ${isOpen ? 'open' : ''}`}>
            <div className={`modal-content ${isOpen ? 'open' : ''}`}>
                
                <MdCancel className="cancel" onClick={onClose} />
                <form className="login" style={loginStyle}>
                    
                    <h1>Login</h1>

                    <div className="form-control">
                        <label for="email"><MdEmail /> Email</label>
                        <input type="email" id="email" placeholder="Enter your email" />
                    </div>

                    <div className="form-control">
                        <label for="password"><IoMdLock /> Password</label>
                        <input type="password" id="password" placeholder="Enter your password" />
                    </div>
                    <div className="form-control-others">
                        <button>Login</button>
                    </div>
                    <div className="form-control-others">
                        <p> -- Or sign in with -- </p>
                        <button><FaGoogle /> Google</button>
                    </div>
                    <div className="form-control-others">
                        <label>
                            Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('signup'); }}>Sign up now</a>
                        </label>
                    </div>
                </form>

                <form className="registration" style={registrationStyle}>
                    <MdCancel className="cancel" onClick={onClose} />
                    <h1>Create Account</h1>

                    <div className="horiz-form">
                        <div className="form-control">
                            <label for="first-name"><FaUser /> First Name</label>
                            <input type="first-name" id="first-name" placeholder="Enter your first name" />
                        </div>
                        <div className="form-control">
                            <label for="last-name"><FaUser /> Last Name</label>
                            <input type="last-name" id="last-name" placeholder="Enter your last name" />
                        </div>
                    </div>

                    <div className="form-control2">
                        <label for="email"><MdEmail /> Email</label>
                        <input type="email" id="email" placeholder="Enter your email" />
                    </div>

                    <div className="form-control2">
                        <label for="password"><IoMdLock /> Password</label>
                        <input type="password" id="password" placeholder="Enter your password" />
                    </div>
                    <div className="form-control2">
                        <label for="password"><IoMdLock /> Confirm Password</label>
                        <input type="password" id="password" placeholder="Confirm your password" />
                    </div>

                    <div className="form-control-others">
                        <button>Create Account</button>
                    </div>
                    <div className="form-control-others">
                        <p> -- Or sign in with -- </p>
                        <button><FaGoogle /> Google</button>
                    </div>
                    <div className="form-control-others">
                        <label>
                            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Log in</a>
                        </label>
                    </div>
                </form>
            </div>
        </div>
    )
}