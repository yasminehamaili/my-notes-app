'use client';

import React from 'react'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import style from './signin.module.css'

const SignIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const router = useRouter()
    
const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
        console.log('Sending request to:', '../api/auth/signin');
        console.log('Request data:', { email, password: '***', confirmPassword: '***' });

        const response = await fetch('../api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, confirmPassword }),
        })

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Raw response:', responseText);


        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Parsed JSON data:', data);
        } catch (parseError) {
            console.error('Failed to parse JSON:', parseError);
            console.log('Response was not JSON, content:', responseText.substring(0, 200));
            setError('Server returned invalid response format');
            setLoading(false);
            return;
        }

        if (response.ok) {
            console.log("Signup successful:", data);
            setSuccess(data.message || 'Account created successfully!');
            
            if (data.isNewUser && data.user && data.user.id) {
                sessionStorage.setItem('showWelcome', 'true');
                sessionStorage.setItem('userId', data.user.id);
                console.log('Set sessionStorage:', {
                    showWelcome: 'true',
                    userId: data.user.id
                });
            }
            
            setTimeout(() => {
                router.push('/main');
            }, 2000);
        } else {
            console.error('Request failed:', data);
            setError(data.error || 'Account creation failed');
        }
    } catch (err) {
        console.error('Network or parsing error:', err);
        console.error('Error details:', err.message, err.stack);
        setError(`Network error: ${err.message}`);
    }

    setLoading(false);
}

    return (
        <>
        <section className={style.signIn}>
            <Image className={style.img} alt='cat-png' src='/images/cat-original.png' width={500} height={500}></Image>
            <div className={style.signInEl}>
                <h1 className={style.title}>Sign Up</h1>
                {error && (
                    <div style={{color: 'red', textAlign: 'center'}}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className={style.form}>
                    <div className={style.input}>
                        <input 
                            className={style.inputEl} 
                            type='email' 
                            placeholder='email' 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className={style.input}>
                        <input 
                            className={style.inputEl} 
                            type='password' 
                            placeholder='password' 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className={style.input}>
                        <input 
                            className={style.inputEl} 
                            type='password' 
                            placeholder='confirm password' 
                            required 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <button type='submit' disabled={loading} className={style.btn}>Sign In
                    </button>
                </form>
                
                <p className={style.vs}>Already have an account?<a className={style.span} href='./../login'> Log In</a></p>
            </div>
        </section>
        </>
    )
}

export default SignIn