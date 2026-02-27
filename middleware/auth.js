export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    // Grab the cookies from the browser/server request headers
    const headers = useRequestHeaders(['cookie'])

    // Send the request. The browser will automatically attach the httpOnly cookie!
    const response = await $fetch('/api/verify-token', {
      method: 'POST',
      headers: headers // This line is crucial for Nuxt Server-Side Rendering
    })

    if (!response.valid) {
      return navigateTo('/register')
    }
  } catch (error) {
    console.log('Auth Middleware Error:', error.message)
    return navigateTo('/register')
  }
})