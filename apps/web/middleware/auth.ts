export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (import.meta.client) {
    auth.restoreSession()
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
