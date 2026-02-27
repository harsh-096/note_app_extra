<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  rawMarkdown: String
})

marked.use({
  gfm: true,
  breaks: true 
})

const compiledMarkdown = computed(() => {
  if (!props.rawMarkdown) return ''
  
  try {
    const textParts = props.rawMarkdown.split(/(```[\s\S]*?```)/g)
    const processedText = textParts.map((part, index) => {
      if (index % 2 === 0) {
        return part.replace(/\n{3,}/g, (match) => {
          return '\n\n' + '<br>\n\n'.repeat(match.length - 2)
        })
      }
      return part
    }).join('')

    const rawHtml = marked.parse(processedText)
    
    if (process.client) {
      return DOMPurify.sanitize(rawHtml)
    }
    return ''
    
  } catch (error) {
    console.error("Markdown parsing error:", error)
    return '<p class="text-red-400">Error loading preview.</p>'
  }
})
</script>

<template>
  <div class="flex flex-col h-full min-h-0 bg-zinc-900/20">
    <div class="px-5 py-3 border-b border-white/5 bg-black/20 text-xs font-mono uppercase tracking-widest text-zinc-300 shrink-0">
      Live Preview
    </div>
    <ClientOnly>
      <div 
        class="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 prose prose-invert prose-purple max-w-none leading-snug prose-p:my-2 prose-headings:font-semibold prose-headings:mt-5 prose-headings:mb-2 prose-ul:my-2 prose-li:my-0 prose-pre:my-3 prose-pre:px-4 prose-pre:py-3 prose-blockquote:my-3 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-a:text-purple-400 prose-hr:my-4"
        v-html="compiledMarkdown"
      ></div>
      <template #fallback>
        <div class="flex-1 min-h-0 p-8 text-sm text-zinc-500 font-mono animate-pulse">
          Loading preview...
        </div>
      </template>
    </ClientOnly>
  </div>
</template>