'use client';

import React from 'react'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import style from './login.module.css'

const LogIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(data.message || 'Logged in successfully!')
                if (data.user && data.user.id) {
                    localStorage.setItem('userId', data.user.id);
                    localStorage.setItem('userName', data.user.name);
                    localStorage.setItem('userImage', data.user.profileImage || '/images/user.png');
                    
                }
                
                setTimeout(() => {
                    router.push('/main')
                }, 1500)
            } else {
                setError(data.error || 'Login failed')
            }
        } catch (err) {
            console.error('Network error:', err)
            setError('Network error. Please try again.')
        }

        setLoading(false)
    }

  return (
    <>
    <section className={style.logIn}>
        <div className={style.logInEl}>
            <h1 className={style.title}>Log In</h1>
            {error && (
                <div style={{color: 'red', textAlign: 'center', marginBottom: '10px'}}>
                    {error}
                </div>
            )}
            <form className={style.form} onSubmit={handleSubmit}>
                <div className={style.inputs}>
                    <input 
                        type='email' 
                        required 
                        placeholder='email' 
                        className={style.input} 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        disabled={loading}
                    />
                    <input 
                        type='password' 
                        required 
                        placeholder='password' 
                        className={style.input} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        disabled={loading}
                    />
                </div>
                <button type='submit' className={style.btn} disabled={loading}>Log IN</button>
            </form>
            <p className={style.vs}>Do not have an account? <a className={style.span} href='/signin'>Sign up</a></p>
        </div>
        <Image alt='cat-png' src='/images/cat-original.png' width={500} height={500} className={style.img}></Image>
    </section>
    </>
  )
}

export default LogIn