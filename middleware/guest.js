export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    const headers = useRequestHeaders(['cookie'])

    const response = await $fetch('/api/verify-token', {
      method: 'POST',
      headers: headers
    })

    // If they ARE valid, bounce them away from the login/register page and to the home page
    if (response.valid) {
      return navigateTo('/')
    }
  } catch (error) {
    // If it fails, do nothing. Let them stay on the login page.
  }
})