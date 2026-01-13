import {StringInputProps, useFormValue} from 'sanity'
import {TextInput} from '@sanity/ui'

export default function ProxyStringInput(props: StringInputProps) {
  const {schemaType, elementProps} = props
  const path = schemaType.options?.field as string
  const value = useFormValue(path ? path.split('.') : []) as string | undefined

  return (
    <TextInput
      {...elementProps}
      value={value || ''}
      readOnly
      style={{opacity: 0.7}}
    />
  )
}
