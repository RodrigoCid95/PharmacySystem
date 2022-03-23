import React from "react"
import { useBoolean } from '@fluentui/react-hooks'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { DateRangeType } from '@fluentui/date-time-utilities'
import { Calendar } from "@fluentui/react/lib/Calendar"
import { DefaultButton } from "@fluentui/react/lib/Button"
import { Dropdown } from "@fluentui/react/lib/Dropdown"
import Alert from "./alert"
interface FilterProps {
  onChange: (dates: string[] | string) => void
}
const Filter: React.FC<FilterProps> = ({ onChange }) => {
  const [isOpenDatePicker, { setTrue: showDatePicker, setFalse: hideDatePicker }] = useBoolean(false)
  const [text, setText] = React.useState('Selecciona un rango de fechas ...')
  return (
    <React.Fragment>
      <DefaultButton
        onClick={showDatePicker} text={text}
        className={mergeStyles({ marginBottom: '1rem' })}
      />
      {isOpenDatePicker && (
        <DatePicker
          onDismiss={dates => {
            if (dates !== undefined) {
              onChange(dates)
              if (Array.isArray(dates)) {
                setText(`De ${dates[0]} a ${dates[1]}.`)
              } else if (typeof dates === 'string' && dates !== '') {
                setText(`Del día ${dates}`)
              } else if (typeof dates === 'string' && dates === '') {
                setText('Desde el principio')
              } else {
                setText('Selecciona un rango de fechas ...')
              }
            }
            hideDatePicker()
          }}
        />
      )}
    </React.Fragment>
  )
}
interface DatePickerProps {
  onDismiss: (dates?: string[] | string) => void
}
enum RangeType {
  DAY,
  WEEK,
  MONTH,
  NONE
}
const DatePicker: React.FC<DatePickerProps> = ({ onDismiss }) => {
  const [rangeType, setRangeType] = React.useState(RangeType.DAY)
  return (
    <Alert
      title='Selecciona un rango de fechas'
      onDismiss={() => onDismiss()}
    >
      <Dropdown
        label="Seleccionar rango de fechas por:"
        options={[
          { key: 'DAY', data: RangeType.DAY, text: 'Día', selected: true },
          { key: 'WEEK', data: RangeType.WEEK, text: 'Semana' },
          { key: 'MONTH', data: RangeType.MONTH, text: 'Mes' },
          { key: 'NONE', data: RangeType.NONE, text: 'Desde el principio' },
        ]}
        onChanged={e => {
          if (e.data === RangeType.NONE) {
            onDismiss('')
          } else {
            setRangeType(e.data)
          }
        }}
      />
      <Calendar
        isDayPickerVisible={rangeType !== RangeType.MONTH}
        strings={{
          months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          days: ['Lunes', 'Martes', 'Miércoles', 'Juéves', 'Viernes', 'Sábado', 'Domingo'],
          shortDays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
          goToToday: 'Hoy'
        }}
        dateRangeType={(() => {
          switch (rangeType) {
            case RangeType.DAY:
              return DateRangeType.Day
            case RangeType.WEEK:
              return DateRangeType.Week
            case RangeType.MONTH:
              return DateRangeType.Month
            default:
              return undefined
          }
        })()}
        onSelectDate={(date, dates) => {
          switch (rangeType) {
            case RangeType.DAY:
              onDismiss(`${date.getFullYear()}-${(m => m < 10 ? `0${m}` : m)(date.getMonth() + 1)}-${(d => d < 10 ? `0${d}` : d)(date.getDate())}`)
              break
            case RangeType.WEEK:
              if (dates) {
                onDismiss([
                  `${dates[0].getFullYear()}-${(m => m < 10 ? `0${m}` : m)(dates[0].getMonth() + 1)}-${(d => d < 10 ? `0${d}` : d)(dates[0].getDate())}`,
                  `${dates[6].getFullYear()}-${(m => m < 10 ? `0${m}` : m)(dates[6].getMonth() + 1)}-${(d => d < 10 ? `0${d}` : d)(dates[6].getDate())}`
                ])
              }
              break
            case RangeType.MONTH:
              dates = [new Date(date.getFullYear(), date.getMonth()), new Date(date.getFullYear(), date.getMonth() + 1, 0)]
              onDismiss([
                `${dates[0].getFullYear()}-${(m => m < 10 ? `0${m}` : m)(dates[0].getMonth() + 1)}-${(d => d < 10 ? `0${d}` : d)(dates[0].getDate())}`,
                `${dates[1].getFullYear()}-${(m => m < 10 ? `0${m}` : m)(dates[1].getMonth() + 1)}-${(d => d < 10 ? `0${d}` : d)(dates[1].getDate())}`
              ])
              break
            default:
              onDismiss('')
              break
          }
        }}
        className={mergeStyles({ margin: '0 auto' })}
      />
    </Alert>
  )
}
export default Filter