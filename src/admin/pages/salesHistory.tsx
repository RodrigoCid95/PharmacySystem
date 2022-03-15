import React from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import Filter from './../components/filter'
export default class SalesHistory extends React.Component {
  render() {
    return (
      <Stack>
        <Filter
          onChange={e => console.log(e)}
        />
        <Stack></Stack>
      </Stack>
    )
  }
}