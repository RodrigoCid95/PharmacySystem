import React from 'react'
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner'
import { Stack } from '@fluentui/react/lib/Stack'
import { mergeStyles } from '@fluentui/react/lib/Styling'
const Loading: React.FC<{ label?: string }> = ({ label }) => (
  <Stack horizontalAlign="center" verticalAlign="center" className={mergeStyles({ height: '100%' })}>
    <Spinner
      label={label}
      size={SpinnerSize.large}
    />
  </Stack>
)
export default Loading