import type { ApiEnvelope, ApiErrorBody } from '~/types/api'

interface ApiRequestOptions<TBody> {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: TBody
  query?: Record<string, string | number | boolean | undefined>
  auth?: boolean
}

function buildQuery(
  query?: Record<string, string | number | boolean | undefined>
) {
  const params = new URLSearchParams()

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export function useApi() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  async function request<TResponse, TBody = unknown>(
    path: string,
    options: ApiRequestOptions<TBody> = {}
  ) {
    const headers = new Headers({
      Accept: 'application/json'
    })

    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json')
    }

    if (options.auth && auth.accessToken) {
      headers.set('Authorization', `Bearer ${auth.accessToken}`)
    }

    const response = await fetch(
      `${config.public.apiBaseUrl}${path}${buildQuery(options.query)}`,
      {
        method: options.method ?? 'GET',
        headers,
        body:
          options.body === undefined
            ? undefined
            : JSON.stringify(options.body)
      }
    )

    if (response.status === 204) {
      return undefined as TResponse
    }

    const payload = await response.json().catch(() => null) as
      | ApiEnvelope<TResponse>
      | ApiErrorBody
      | null

    if (!response.ok) {
      const apiError =
        payload && typeof payload === 'object' && 'error' in payload
          ? payload.error
          : undefined

      const message =
        payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
          ? payload.message
          : apiError && typeof apiError.message === 'string'
            ? apiError.message
            : 'No se pudo completar la operación'

      throw new Error(message)
    }

    return (payload as ApiEnvelope<TResponse>).data
  }

  return { request }
}
