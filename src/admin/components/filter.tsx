import React from "react"
import { useBoolean } from '@fluentui/react-hooks/lib/useBoolean'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { Stack } from '@fluentui/react/lib/Stack'
import { Toggle } from '@fluentui/react/lib/Toggle'
import { DateRangeType } from '@fluentui/date-time-utilities/lib/dateValues/dateValues'
import { Calendar } from "@fluentui/react/lib/Calendar"
import { DefaultButton } from "@fluentui/react/lib/Button"
import Alert from "./alert"
interface FilterProps {
  onChange: (dates: Date[]) => void
}
const Filter: React.FC<FilterProps> = ({ onChange }) => {
  const [isOpenDatePicker, { setTrue: showDatePicker, setFalse: hideDatePicker }] = useBoolean(false)
  const [text, setText] = React.useState('Selecciona una fecha ...')
  return (
    <Stack className={mergeStyles({ padding: '1rem', display: 'flex', flexDirection: 'row' })}>
      <DefaultButton onClick={showDatePicker} text={text} />
      {isOpenDatePicker && (
        <DatePicker
          onDismiss={dates => {
            if (Array.isArray(dates)) {
              onChange(dates)
              setText(`De ${dates[0].toLocaleDateString()} a ${dates[1].toLocaleDateString()}.`)
            }
            hideDatePicker()
          }}
        />
      )}
    </Stack>
  )
}
interface DatePickerProps {
  onDismiss: (dates?: Date[]) => void
}
const DatePicker: React.FC<DatePickerProps> = ({ onDismiss }) => {
  const [rangeForWeek, { toggle: changeRangeForWeek }] = useBoolean(false)
  return (
    <Alert
      title='Selecciona un rango de fechas'
      onDismiss={onDismiss}
    >
      <Toggle
        label='Filtrar por:'
        onText="Semana"
        offText="Mes"
        inlineLabel
        onChange={changeRangeForWeek}
      />
      <Calendar
        isDayPickerVisible={rangeForWeek}
        strings={{
          months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          days: ['Lunes', 'Martes', 'Miércoles', 'Juéves', 'Viernes', 'Sábado', 'Domingo'],
          shortDays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
          goToToday: 'Hoy'
        }}
        dateRangeType={rangeForWeek ? DateRangeType.Week : DateRangeType.Month}
        onSelectDate={(date, dates) => onDismiss([(rangeForWeek && dates) ? dates[0] : new Date(date.getFullYear(), date.getMonth()), (rangeForWeek && dates) ? dates[6] : new Date(date.getFullYear(), date.getMonth() + 1, 0)])}
        className={mergeStyles({ margin: '0 auto' })}
      />
    </Alert>
  )
}
export default Filter