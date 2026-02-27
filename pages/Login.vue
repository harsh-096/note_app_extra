<script setup>
  import Swal from 'sweetalert2'

  definePageMeta({
    middleware: ['guest'],
  })

  const email = ref('')
  const password = ref('')
  const loading = ref(false)

  async function submit() {
    loading.value = true

    try {
      const response = await $fetch('/api/login', {
        method: "POST",
        body: {
          email: email.value,
          password: password.value, 
        },
      })

      if (response.success) {
        await Swal.fire({
          title: 'Welcome Back!',
          text: 'Logging you in...',
          icon: 'success',
          timer: 1500, 
          showConfirmButton: false
        })

        await navigateTo('/') 
      }

    } catch(err) {
      console.error('Login error:', err)
      
      // Grab the status code from Nuxt's error object
      const statusCode = err.response?.status || err.statusCode

      // SCENARIO 1: Email not found in database (404)
      if (statusCode === 404) {
        const result = await Swal.fire({
          title: 'Account Not Found',
          text: "We couldn't find an account registered with that email.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#a855f7', 
          cancelButtonColor: '#3f3f46',
          confirmButtonText: 'Go to Register',
          cancelButtonText: 'Try Again'
        })

        if (result.isConfirmed) {
          await navigateTo('/register')
        }
      } 
      // SCENARIO 2: Email found, but wrong password (401)
      else if (statusCode === 401) {
        Swal.fire({
          title: 'Incorrect Password',
          text: 'The password you entered is incorrect. Please try again.',
          icon: 'error',
          confirmButtonColor: '#a855f7'
        })
      } 
      // SCENARIO 3: Any other server error
      else {
        Swal.fire({
          title: 'Oops!',
          text: err.data?.message || 'Something went wrong.',
          icon: 'error',
          confirmButtonColor: '#a855f7'
        })
      }
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0A0E13]">
    <div class="absolute inset-0">
      <div class="absolute -left-16 bottom-0 h-80 w-80 rounded-full bg-purple-400/18 blur-3xl"></div>
      <div class="absolute right-10 top-10 h-60 w-60 rounded-full bg-purple-300/12 blur-3xl"></div>
      <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent"></div>
    </div>

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
      <div class="grid w-full items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/60 via-zinc-950/80 to-black p-10 text-zinc-200">
          <h2 class="mt-6 text-3xl font-semibold">Pick up right where you left off.</h2>
          <p class="mt-3 text-sm text-zinc-400">
            Your notes, pinned ideas, and recent work are waiting. Jump back in
            with one clean sign-in.
          </p>

          <div class="mt-8 grid gap-4 text-xs text-zinc-400">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm font-semibold text-white">Recent sync</p>
              <p class="mt-2">Your latest edits are already staged.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm font-semibold text-white">Fast access</p>
              <p class="mt-2">Open your pinned stacks instantly.</p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-white/10 bg-zinc-950/70 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-semibold text-white">Log in to your account</h1>
            <span class="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
              Welcome back
            </span>
          </div>
          <p class="mt-2 text-sm text-zinc-400">
            Don't have an account?
            <nuxt-link to="/register" class="font-semibold text-purple-400">
              Sign Up
            </nuxt-link>
            for one.
          </p>

          <form class="mt-8" @submit.prevent="submit">
            <div>
              <label for="" class="text-xs uppercase tracking-[0.18em] text-zinc-500"
                >Email Address</label
              >
              <input
                v-model="email"
                placeholder="you@example.com"
                type="email"
                required
                class="mt-2 block w-full rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 shadow-inner"
              />
            </div>

            <div class="mt-6">
              <label for="" class="text-xs uppercase tracking-[0.18em] text-zinc-500"
                >Password</label
              >
              <input
                v-model="password"
                placeholder="****************"
                type="password"
                required
                class="mt-2 block w-full rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 shadow-inner"
              />
            </div>

            <div class="mt-6 flex items-center gap-3 text-xs text-zinc-500">
              <div class="h-px flex-1 bg-white/5"></div>
              <span>Secure sign-in</span>
              <div class="h-px flex-1 bg-white/5"></div>
            </div>

            <div class="mt-6">
              <button
                :disabled="loading"
                class="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-500 px-4 py-3 text-sm font-bold text-black shadow-[0_14px_30px_rgba(168,85,247,0.28)] disabled:opacity-50"
              >
                <span>{{ loading ? 'Logging in...' : 'Log in' }}</span>
                <ArrowRight />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>