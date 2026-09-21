import { defineStore } from 'pinia'
import type { AuthResponse, User } from '~/types/api'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload extends LoginPayload {
  name: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref('')
  const refreshToken = ref('')
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(accessToken.value))
  const isAdmin = computed(
    () => user.value?.role === 'ADMIN' || user.value?.role === 'SUPER_ADMIN'
  )

  function restoreSession() {
    if (!import.meta.client) {
      return
    }

    accessToken.value = localStorage.getItem('accessToken') ?? ''
    refreshToken.value = localStorage.getItem('refreshToken') ?? ''

    const storedUser = localStorage.getItem('user')
    user.value = storedUser ? JSON.parse(storedUser) as User : null
  }

  function persistSession(data: AuthResponse) {
    user.value = data.user
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken

    if (import.meta.client) {
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = ''

    try {
      const api = useApi()
      const data = await api.request<AuthResponse, LoginPayload>(
        '/auth/login',
        {
          method: 'POST',
          body: payload
        }
      )

      persistSession(data)
    } catch (unknownError) {
      error.value =
        unknownError instanceof Error
          ? unknownError.message
          : 'No se pudo iniciar sesión'
      throw unknownError
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = ''

    try {
      const api = useApi()
      const data = await api.request<AuthResponse, RegisterPayload>(
        '/auth/register',
        {
          method: 'POST',
          body: payload
        }
      )

      persistSession(data)
    } catch (unknownError) {
      error.value =
        unknownError instanceof Error
          ? unknownError.message
          : 'No se pudo crear la cuenta'
      throw unknownError
    } finally {
      loading.value = false
    }
  }

  async function loadMe() {
    if (!accessToken.value) {
      return
    }

    const api = useApi()
    user.value = await api.request<User>('/users/me', { auth: true })

    if (import.meta.client) {
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  function logout() {
    user.value = null
    accessToken.value = ''
    refreshToken.value = ''

    if (import.meta.client) {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    restoreSession,
    login,
    register,
    loadMe,
    logout
  }
})
