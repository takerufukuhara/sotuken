import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import Auth from './components/Auth'
import UserInputPage from './components/UserInputPage'
import ResultsPage from './components/ResultsPage'

import { supabase } from './supabaseClient'
import { UserInfo } from './hooks/useUserInfoForm'
import './styles/index.css'

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleUserInfoSubmit = (data: UserInfo) => {
    setUserInfo(data)
  }

  return (
    <Router>
      <Routes>
        {!session ? (
          <>
            <Route path="/login" element={<Auth />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={<UserInputPage onSubmit={handleUserInfoSubmit} />}
            />
            <Route
              path="/results"
              element={
                userInfo ? <ResultsPage userInfo={userInfo} /> : <Navigate to="/" replace />
              }
            />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App
