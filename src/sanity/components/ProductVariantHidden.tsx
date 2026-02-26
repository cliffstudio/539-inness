import {WarningOutlineIcon} from '@sanity/icons'
import {StringFieldProps, useFormValue} from 'sanity'
import {Box, Card, Flex, Stack, Text} from '@sanity/ui'
import {productVariantUrl} from '../../utils/shopifyUrls'

type Store = {
  productId: number
  id: number
  isDeleted: boolean
}

export default function ProductVariantHiddenInput(_props: StringFieldProps) {
  const store: Store = useFormValue(['store']) as Store

  if (!store) {
    return <></>
  }

  const shopifyVariantUrl = productVariantUrl(store?.productId, store?.id)
  const isDeleted = store?.isDeleted

  let message = 'This variant is hidden'
  if (isDeleted) {
    message = 'It has been deleted from Shopify.'
  }

  return (
    <Card padding={4} radius={2} shadow={1} tone="critical">
      <Flex align="flex-start">
        <Text size={2}>
          <WarningOutlineIcon />
        </Text>
        <Box flex={1} marginLeft={3}>
          <Box>
            <Text size={2} weight="semibold">
              This product variant is hidden
            </Text>
          </Box>
          <Stack marginTop={4} space={2}>
            <Text size={1}>{message}</Text>
          </Stack>
          {!isDeleted && shopifyVariantUrl && (
            <Box marginTop={4}>
              <Text size={1}>
                →{' '}
                <a href={shopifyVariantUrl} target="_blank" rel="noreferrer">
                  View this variant on Shopify
                </a>
              </Text>
            </Box>
          )}
        </Box>
      </Flex>
    </Card>
  )
}
