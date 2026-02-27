<script setup>
defineProps({
  versions: {
    type: Array,
    default: () => []
  },
  isLoading: Boolean
})

defineEmits(['close', 'restore'])

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="w-64 shrink-0 rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl flex flex-col overflow-hidden shadow-2xl h-full">
    <div class="p-5 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
      <span class="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">History</span>
      <button @click="$emit('close')" class="text-zinc-500 hover:text-white transition-colors">✕</button>
    </div>

    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <div v-if="isLoading" class="text-center p-4 text-zinc-600 text-xs animate-pulse">Loading...</div>
      <div v-else-if="versions.length === 0" class="text-center p-4 text-zinc-600 text-xs">No history yet</div>
      
      <div 
        v-else
        v-for="v in versions" 
        :key="`v-${v.id}`"
        class="group relative rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 hover:border-white/10"
        :class="{ 'border-green-500/30 bg-green-500/5': v.isLatest }"
        @click="$emit('restore', v)"
      >
        <div class="flex justify-between items-start">
          <p class="text-xs font-medium text-zinc-300 truncate flex-1">
            v{{ v.versionNum }}{{ v.isLatest ? ' (Latest)' : '' }}
          </p>
          <span class="text-[10px] text-zinc-600 font-mono ml-2">{{ formatTime(v.savedAt) }}</span>
        </div>
        <p class="text-[10px] text-zinc-500 mt-1">{{ formatDate(v.savedAt) }}</p>
        
        <div class="absolute inset-0 flex items-center justify-center bg-purple-500/80 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm" v-if="!v.isLatest">
          Restore
        </div>
        <div class="absolute inset-0 flex items-center justify-center bg-green-500/80 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm" v-else>
          Current
        </div>
      </div>
    </div>
  </div>
</template>