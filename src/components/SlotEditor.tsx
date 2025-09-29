//スケジュール入力
import React, { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { UserInfo } from '../hooks/useUserInfoForm'

interface SlotEditorProps {
  dayIndex: number
}

const SlotEditor: React.FC<SlotEditorProps> = ({ dayIndex }) => {
  const { control, register } = useFormContext<UserInfo>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `schedule.${dayIndex}.slots`
  })

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [addHover, setAddHover] = useState(false)

  return (
    <div style={containerStyle}>
      {fields.map((slot, si) => (
        <div key={slot.id} style={slotRowStyle}>
          <label style={labelStyle}>
            開始:
            <input
              {...register(`schedule.${dayIndex}.slots.${si}.start`)}
              type="time"
              required
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            終了:
            <input
              {...register(`schedule.${dayIndex}.slots.${si}.end`)}
              type="time"
              required
              style={inputStyle}
            />
          </label>
          <button
            type="button"
            onClick={() => remove(si)}
            style={
              hoveredIndex === si ? { ...buttonStyle, ...buttonHoverStyle } : buttonStyle
            }
            onMouseEnter={() => setHoveredIndex(si)}
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label="時間帯を削除"
            title="削除"
          >
             削除
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ start: '09:00', end: '17:00' })}
        style={addHover ? { ...addButtonStyle, ...addButtonHoverStyle } : addButtonStyle}
        onMouseEnter={() => setAddHover(true)}
        onMouseLeave={() => setAddHover(false)}
      >
        ＋ 時間帯を追加
      </button>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  marginBottom: 12,
}

const slotRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const labelStyle: React.CSSProperties = {
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}

const inputStyle: React.CSSProperties = {
  padding: 8,
  border: '1px solid #ccc',
  borderRadius: 6,
  width: 100,
  marginLeft: 4,
  marginRight: 8,
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#ff4d4d',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  minWidth: 64,
  transition: 'background-color 0.2s ease',
}

const buttonHoverStyle: React.CSSProperties = {
  backgroundColor: '#e74c3c',
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
  alignSelf: 'flex-start',
}

const addButtonHoverStyle: React.CSSProperties = {
  backgroundColor: '#999999',
}

export default SlotEditor
