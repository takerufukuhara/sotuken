//ログイン画面
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const Auth: React.FC = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage]   = useState('')
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSignUp) {
      // サインアップ処理
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('サインアップに成功しました。ログイン画面に戻ります…')
        setIsSignUp(false)
      }
    } else {
      // ログイン処理
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('ログインに成功しました。ユーザー情報入力画面へ移動します…')
        // ログイン成功後、ユーザー情報入力ページ（"/"）へ遷移
        navigate('/', { replace: true })
      }
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: '0 auto', padding: 16 }}>
      <h2>{isSignUp ? 'サインアップ' : 'ログイン'}</h2>
      <form onSubmit={handleAuth}>
        <div>
          <label>メールアドレス</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, margin: '8px 0' }}
          />
        </div>
        <div>
          <label>パスワード</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, margin: '8px 0' }}
          />
        </div>
        <button
          type="submit"
          style={{ width: '100%', padding: 10, marginTop: 12 }}
        >
          {isSignUp ? 'サインアップ' : 'ログイン'}
        </button>
      </form>

      <button
        onClick={() => {
          setIsSignUp(prev => !prev)
          setMessage('')
        }}
        style={{
          marginTop: 12,
          background: 'none',
          border: 'none',
          color: '#0070f3',
          cursor: 'pointer'
        }}
      >
        {isSignUp ? 'ログインに戻る' : '新規登録はこちら'}
      </button>

      {message && (
        <p style={{ marginTop: 16, color: isSignUp ? 'green' : 'blue' }}>
          {message}
        </p>
      )}
    </div>
  )
}

export default Auth
