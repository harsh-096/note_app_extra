<script setup>
defineProps({
  notes: {
    type: Array,
    default: () => []
  },
  activeNoteId: [Number, String]
})

defineEmits(['select-note', 'create-note', 'delete-note'])

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col h-full min-h-0 bg-black/40">
    <div class="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
      <span class="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Your Notes</span>
      <button 
        @click="$emit('create-note')" 
        class="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all"
      >
        +
      </button>
    </div>
    
    <div class="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
      <div 
        v-for="note in notes" :key="note.id"
        @click="$emit('select-note', note.id)"
        :class="[
          'p-4 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden group',
          activeNoteId === note.id 
            ? 'bg-purple-500/10 border-purple-500/30 text-white shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]' 
            : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 hover:border-white/10'
        ]"
      >
        <div v-if="activeNoteId === note.id" class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
        
        <div class="flex justify-between items-start gap-2">
          <div class="overflow-hidden flex-1">
            <p class="text-sm font-semibold truncate">{{ note.title }}</p>
            <p class="text-[10px] text-zinc-600 mt-2 font-mono">{{ formatDate(note.updatedAt) }}</p>
          </div>

          <button 
            @click.stop="$emit('delete-note', note.id)"
            class="text-zinc-500 hover:text-red-400 transition-all p-1 -mr-1 -mt-1"
            title="Delete Note"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>