import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import './Auth.css'

export default function Auth({ mode = 'login' }) {
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    phone: '' 
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) navigate('/booking')
    })
    return unsubscribe
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const { user } = await createUserWithEmailAndPassword(
          auth, 
          form.email, 
          form.password
        )
        await updateProfile(user, { displayName: form.name })
        await setDoc(doc(db, "users", user.uid), {
          name: form.name,
          phone: form.phone,
          email: form.email,
          createdAt: new Date().toISOString()
        })
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password)
      }
      navigate('/booking')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>{mode === 'register' ? 'Регистрация' : 'Вход'}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <input
              name="name"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Имя"
              required
            />
            <input
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              placeholder="Телефон"
              required
            />
          </>
        )}
        
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
          placeholder="Email"
          required
        />
        
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={(e) => setForm({...form, password: e.target.value})}
          placeholder="Пароль"
          required
          minLength={6}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>

      <button 
        type="button"
        onClick={() => navigate(mode === 'register' ? '/login' : '/register')}
      >
        {mode === 'register' ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
    </div>
  )
}