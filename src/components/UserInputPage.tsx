// ユーザー入力画面
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserInfoForm, UserInfo } from '../hooks/useUserInfoForm'
import { FormProvider } from 'react-hook-form'
import SlotEditor from './SlotEditor'
import { supabase } from '../supabaseClient'
import { addDays, format } from 'date-fns'

interface UserInputPageProps {
  onSubmit: (data: UserInfo) => void
}

const UserInputPage: React.FC<UserInputPageProps> = ({ onSubmit }) => {
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState<UserInfo | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserInfo = async () => {
      const today = new Date()
      const tomorrow = addDays(today, 1)
      const defaultSchedule = [
        { date: format(today, 'yyyy-MM-dd'), slots: [{ start: '09:00', end: '17:00' }] },
        { date: format(tomorrow, 'yyyy-MM-dd'), slots: [{ start: '09:00', end: '17:00' }] }
      ]

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!user || userError) {
        setInitialValues({
          chores: [],
          items: [],
          schedule: defaultSchedule,
          hasHumidifier: false,
          hasAirConditioner: false,
          hasDryer: false,
        })
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('chores, items, schedule, hasHumidifier, hasAirConditioner, hasDryer')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user info:', error)
      }

      setInitialValues({
        chores: data?.chores ?? [],
        items: data?.items ?? [],
        schedule: data?.schedule?.length === 2 ? data.schedule : defaultSchedule,
        hasHumidifier: data?.hasHumidifier ?? false,
        hasAirConditioner: data?.hasAirConditioner ?? false,
        hasDryer: data?.hasDryer ?? false,
      })

      setLoading(false)
    }

    fetchUserInfo()
  }, [])

  const {
    form,
    choresArray,
    itemsArray,
    daysArray,
    onSubmit: handleSubmit
  } = useUserInfoForm(async (data) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        chores: data.chores,
        items: data.items,
        schedule: data.schedule,
        hasHumidifier: data.hasHumidifier,
        hasAirConditioner: data.hasAirConditioner,
        hasDryer: data.hasDryer,
      })

    if (error) {
      console.error('Error saving user info:', error)
      alert('保存に失敗しました')
      return
    }

    onSubmit(data)
    navigate('/results')
  }, initialValues)

  if (loading) return <p>Loading...</p>

  const { register } = form

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <div style={cardStyle}>
          <h2>① 天候依存家事の設定</h2>
          {choresArray.fields.map((chore, i) => (
            <div key={chore.id} style={choreCardStyle}>
              <label style={labelStyle}>家事名</label>
              <input {...register(`chores.${i}.name`)} required style={inputStyle} />

              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => choresArray.remove(i)}
                  style={buttonStyle}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e74c3c')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ff4d4d')}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => choresArray.append({ name: '', idealFrequency: 2, lastPerformedDate: '' })}
            style={addButtonStyle}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#999999')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#bbbbbb')}
          >
            ＋ 家事を追加
          </button>
        </div>

        <div style={cardStyle}>
          <h2>② 住環境設備</h2>
          <label style={rowStyle}>
            <input type="checkbox" {...register('hasHumidifier')} />
            <span>加湿器がある</span>
          </label>
          <label style={rowStyle}>
            <input type="checkbox" {...register('hasAirConditioner')} />
            <span>エアコンがある</span>
          </label>
          <label style={rowStyle}>
            <input type="checkbox" {...register('hasDryer')} />
            <span>乾燥機がある</span>
          </label>
        </div>

        <div style={cardStyle}>
          <h2>③ 天候依存の持ち物</h2>
          {itemsArray.fields.map((item, i) => (
            <div key={item.id} style={rowStyle}>
              <input {...register(`items.${i}.name`)} required style={inputStyle} />
              <button
                type="button"
                onClick={() => itemsArray.remove(i)}
                style={buttonStyle}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e74c3c')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ff4d4d')}
              >
                削除
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => itemsArray.append({ name: '' })}
            style={addButtonStyle}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#999999')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#bbbbbb')}
          >
            ＋ 持ち物を追加
          </button>
        </div>

        <div style={cardStyle}>
          <h2>④ 外出スケジュール（今日と明日のみ）</h2>
          {daysArray.fields.map((day, di) => (
            <div key={day.id} style={{ marginBottom: 12 }}>
              <input {...register(`schedule.${di}.date`)} type="date" required style={inputStyle} readOnly />
              <SlotEditor dayIndex={di} />
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            type="submit"
            style={submitButtonStyle}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#007bff')}
          >
            提案を受け取る
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

// スタイル定義（変更なし）
const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  padding: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  marginBottom: 24
}

const choreCardStyle: React.CSSProperties = {
  background: '#f9f9f9',
  padding: 12,
  borderRadius: 6,
  marginBottom: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 8
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8
}

const labelStyle: React.CSSProperties = {
  fontWeight: 'bold'
}

const inputStyle: React.CSSProperties = {
  padding: 8,
  border: '1px solid #ccc',
  borderRadius: 4,
  width: '100%'
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#ff4d4d',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  fontWeight: 'bold',
  minWidth: 64,
}

const addButtonStyle: React.CSSProperties = {
  backgroundColor: '#bbbbbb',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  padding: '12px 24px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'background-color 0.2s ease',
  marginTop: 8,
}

const submitButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '1rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'background-color 0.2s ease',
}

export default UserInputPage
