import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { format } from 'date-fns'

export interface ChoreSetting {
  name: string
  idealFrequency: number
  lastPerformedDate: string
}

export interface Item {
  name: string
}

export interface ScheduleSlot {
  start: string
  end: string
}

export interface DaySchedule {
  date: string
  slots: ScheduleSlot[]
}

export interface UserInfo {
  chores: ChoreSetting[]
  items: Item[]
  schedule: DaySchedule[]
  hasHumidifier: boolean
  hasAirConditioner: boolean
  hasDryer: boolean
}

// 今日と明日の日付を取得するヘルパー関数
function getTodayAndTomorrow(): DaySchedule[] {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  return [
    {
      date: format(today, 'yyyy-MM-dd'),
      slots: [{ start: '09:00', end: '17:00' }]
    },
    {
      date: format(tomorrow, 'yyyy-MM-dd'),
      slots: [{ start: '09:00', end: '17:00' }]
    }
  ]
}

export function useUserInfoForm(
  onSubmit: SubmitHandler<UserInfo>,
  initialValues?: UserInfo
) {
  const form = useForm<UserInfo>({
    defaultValues: initialValues ?? {
      chores: [{ name: '', idealFrequency: 2, lastPerformedDate: '' }],
      items: [{ name: '' }],
      schedule: getTodayAndTomorrow(),
      hasHumidifier: false,
      hasAirConditioner: false,
      hasDryer: false
    }
  })

  const choresArray = useFieldArray({
    control: form.control,
    name: 'chores'
  })

  const itemsArray = useFieldArray({
    control: form.control,
    name: 'items'
  })

  const daysArray = useFieldArray({
    control: form.control,
    name: 'schedule'
  })

  return {
    form,
    choresArray,
    itemsArray,
    daysArray,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
