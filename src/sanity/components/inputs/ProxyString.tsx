import {StringInputProps, useFormValue} from 'sanity'
import {TextInput} from '@sanity/ui'

export default function ProxyStringInput(props: StringInputProps) {
  const {schemaType, elementProps} = props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const path = (schemaType.options as any)?.field as string | undefined
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
