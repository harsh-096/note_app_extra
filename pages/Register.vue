<script setup>
  import Swal from 'sweetalert2'
  import { ArrowRight } from 'lucide-vue-next'

  definePageMeta({
    middleware: ['guest'],
  })
  
  const email = ref('')
  const password = ref('')

  const error = ref('')
  const loading = ref(false)

  async function submit(){
    error.value = ''
    loading.value = true

    try {
      const response = await $fetch('/api/user', {
        method: "POST",
        body: {
          email: email.value,
          password: password.value, 
        },
      })

      const { isConfirmed } = await Swal.fire({
        title: 'Success!',
        text: 'Account created successfully',
        icon: 'success',
        confirmButtonText: 'close',
      })
      if(isConfirmed){
        navigateTo('/')
      }

      email.value = ''
      password.value = ''

    } catch(err) {
      error.value = err.data?.message || err.message || 'Registration failed'
      console.error('Registration error:', err)
    } finally {
      loading.value = false
    }
  }
</script>




<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0B0F14]">
    <div class="absolute inset-0">
      <div class="absolute -left-24 top-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl"></div>
      <div class="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-purple-400/10 blur-[120px]"></div>
      <div class="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/5 blur-3xl"></div>
    </div>

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
      <div class="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="rounded-3xl border border-white/10 bg-zinc-950/70 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div class="flex items-center justify-between">
            <!-- <Logo /> -->
            <span class="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
              New member
            </span>
          </div>

          <h1 class="mt-8 text-3xl font-semibold text-white">
            Sign up for a free account
          </h1>
          <p class="mt-2 text-sm text-zinc-400">
            Already registered?
            <nuxt-link to="/login" class="font-semibold text-purple-400">
              Log in
            </nuxt-link>
            to your account.
          </p>

          <form class="mt-8" @submit.prevent="submit">
            <div v-if="error" class="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
              {{ error }}
            </div>
            <div>
              <label for="" class="text-xs uppercase tracking-[0.18em] text-zinc-500"
                >Email Address</label
              >
              <input
                v-model="email"
                placeholder="you@example.com"
                type="email"
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
                class="mt-2 block w-full rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 shadow-inner"
              />
            </div>

            <div class="mt-6 flex items-center gap-3 text-xs text-zinc-500">
              <div class="h-px flex-1 bg-white/5"></div>
              <span>Start in seconds</span>
              <div class="h-px flex-1 bg-white/5"></div>
            </div>

            <div class="mt-6">
              <button
                :disabled="loading"
                class="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-500 px-4 py-3 text-sm font-bold text-black shadow-[0_14px_30px_rgba(168,85,247,0.28)] disabled:opacity-50"
              >
                <span>{{ loading ? 'Signing up...' : 'Sign Up' }}</span>
                <ArrowRight />
              </button>
            </div>
          </form>
        </div>

        <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/70 via-zinc-950/80 to-black p-10 text-zinc-200">
          <p class="text-xs uppercase tracking-[0.25em] text-zinc-500">The workspace</p>
          <h2 class="mt-4 text-3xl font-semibold">Design your note ritual.</h2>
          <p class="mt-3 text-sm text-zinc-400">
            Build a workspace that matches your pace. Keep notes clean, searchable,
            and ready to ship your next idea.
          </p>

          <div class="mt-8 grid gap-5">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm font-semibold text-white">Mood-first templates</p>
              <p class="mt-2 text-xs text-zinc-400">Start from a clean scene, then layer detail.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm font-semibold text-white">Focused capture</p>
              <p class="mt-2 text-xs text-zinc-400">Capture quickly without losing context.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm font-semibold text-white">Smart sorting</p>
              <p class="mt-2 text-xs text-zinc-400">Pin your best, archive the rest.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

