<script setup>
defineProps({
  title: String,
  content: String
})

defineEmits(['update:title', 'update:content'])
</script>

<template>
  <div class="flex flex-col h-full min-h-0 bg-transparent">
    <div class="px-5 py-3 border-b border-white/5 bg-black/20 shrink-0 flex items-center">
      <input 
        :value="title"
        @input="$emit('update:title', $event.target.value)"
        class="bg-transparent text-xs font-mono tracking-widest text-zinc-200 outline-none w-full focus:text-white transition-colors placeholder:text-zinc-500"
        placeholder="name your note"
      />
    </div>
    <textarea
      :value="content"
      @input="$emit('update:content', $event.target.value)"
      class="flex-1 min-h-0 w-full h-full resize-none bg-transparent p-6 text-sm text-zinc-300 outline-none leading-relaxed placeholder:text-zinc-700 font-mono focus:ring-0"
      placeholder="Start typing your markdown here..."
    ></textarea>
  </div>
</template>