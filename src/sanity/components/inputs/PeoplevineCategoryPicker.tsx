import { useEffect, useMemo, useState } from 'react'
import { Card, Checkbox, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { ArrayOfPrimitivesInputProps, set, unset, useClient } from 'sanity'

const categoriesQuery =
  'array::unique(*[_type == "calendar" && defined(eventCategories) && isActive == true].eventCategories[])'

export default function PeoplevineCategoryPicker(
  props: ArrayOfPrimitivesInputProps<string | number | boolean, any>
) {
  const { value, onChange } = props
  const client = useClient({ apiVersion: '2024-01-01' })

  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selected = useMemo(
    () =>
      (Array.isArray(value) ? value : []).filter(
        (item): item is string => typeof item === 'string'
      ),
    [value]
  )

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const raw = await client.fetch<string[]>(categoriesQuery)
        if (!isMounted) return

        const normalized = (raw || [])
          .map((item) => item?.trim())
          .filter((item): item is string => Boolean(item))
          .sort((a, b) => a.localeCompare(b))

        setOptions(normalized)
      } catch {
        if (!isMounted) return
        setError('Could not load categories from synced Peoplevine events.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [client])

  const toggleCategory = (category: string) => {
    const next = selected.includes(category)
      ? selected.filter((item) => item !== category)
      : [...selected, category]

    onChange(next.length ? set(next) : unset())
  }

  if (loading) {
    return (
      <Flex align="center" gap={2} padding={2}>
        <Spinner muted />
        <Text size={1}>Loading available Peoplevine categories...</Text>
      </Flex>
    )
  }

  if (error) {
    return (
      <Card tone="critical" padding={3} radius={2}>
        <Text size={1}>{error}</Text>
      </Card>
    )
  }

  if (!options.length) {
    return (
      <Card tone="caution" padding={3} radius={2}>
        <Text size={1}>
          No categories found yet. Run the Peoplevine sync first so category options are available.
        </Text>
      </Card>
    )
  }

  return (
    <Stack space={2} paddingY={2}>
      {options.map((category) => (
        <Flex key={category} align="center" gap={2}>
          <Checkbox
            checked={selected.includes(category)}
            onChange={() => toggleCategory(category)}
          />
          <Text size={1}>{category}</Text>
        </Flex>
      ))}
    </Stack>
  )
}
