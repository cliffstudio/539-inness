import {ObjectInputProps, useFormValue} from 'sanity'
import {Stack, Text, TextArea, TextInput} from '@sanity/ui'

function stripHtmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

type SeoValue = {
  metaTitle?: string
  metaDescription?: string
  socialImageUrl?: string
}

export default function ProxySeoInput(props: ObjectInputProps) {
  const storeTitle = useFormValue(['store', 'title']) as string | undefined
  const storeDescriptionHtml = useFormValue(['store', 'descriptionHtml']) as string | undefined
  const storePreviewImageUrl = useFormValue(['store', 'previewImageUrl']) as string | undefined

  const storedSeo = props.value as SeoValue | undefined

  const metaTitle = storedSeo?.metaTitle || storeTitle || ''
  const metaDescription =
    storedSeo?.metaDescription || stripHtmlToPlainText(storeDescriptionHtml || '')
  const socialImageUrl = storedSeo?.socialImageUrl || storePreviewImageUrl || ''

  const readOnlyStyle = {opacity: 0.7}

  return (
    <Stack space={4}>
      <Stack space={2}>
        <Text size={1} weight="medium">
          Title
        </Text>
        <TextInput value={metaTitle} readOnly style={readOnlyStyle} />
      </Stack>
      <Stack space={2}>
        <Text size={1} weight="medium">
          Description
        </Text>
        <TextArea value={metaDescription} readOnly rows={3} style={readOnlyStyle} />
      </Stack>
      <Stack space={2}>
        <Text size={1} weight="medium">
          Social Image URL
        </Text>
        <TextInput value={socialImageUrl} readOnly style={readOnlyStyle} />
      </Stack>
    </Stack>
  )
}
