<script setup>
import { ref, onMounted } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Swal from 'sweetalert2'

definePageMeta({
  middleware: ['auth'],
})

// --- STATE ---
const notes = ref([])
const activeNoteId = ref(null)
const activeNoteTitle = ref('Untitled Note')
const rawMarkdown = ref('')
const isSaving = ref(false)

// History State
const showHistory = ref(false)
const historyVersions = ref([])
const isLoadingHistory = ref(false)

// --- API ACTIONS ---
const fetchNotes = async () => {
  try {
    const response = await $fetch('/api/notes')
    if (response.success) {
      notes.value = response.notes
      if (notes.value.length > 0) await selectNote(notes.value[0].id)
    }
  } catch (error) { console.error('Error fetching notes:', error) }
}

const selectNote = async (id) => {
  activeNoteId.value = id
  showHistory.value = false // Close history when switching notes
  try {
    const response = await $fetch(`/api/notes/${id}`)
    if (response.success) {
      rawMarkdown.value = response.note.content
      activeNoteTitle.value = response.note.title
    }
  } catch (error) { console.error('Failed to load note', error) }
}

const createNewNote = async () => {
  try {
    const response = await $fetch('/api/notes/create', { method: 'POST' })
    if (response.success) {
      notes.value.unshift(response.note)
      activeNoteId.value = response.note.id
      rawMarkdown.value = response.note.content 
      activeNoteTitle.value = response.note.title
      showHistory.value = false
    }
  } catch (error) { console.error('Error creating note:', error) }
}

const saveNote = async () => {
  if (!activeNoteId.value) return
  
  console.log('Saving note:', activeNoteId.value)
  console.log('Title:', activeNoteTitle.value)
  console.log('Content length:', rawMarkdown.value?.length)
  
  isSaving.value = true
  try {
    const response = await $fetch(`/api/notes/${activeNoteId.value}`, {
      method: 'PUT',
      body: { title: activeNoteTitle.value, content: rawMarkdown.value }
    })
    
    console.log('Save response:', response)
    
    if (response.success) {
      const noteIndex = notes.value.findIndex(n => n.id === activeNoteId.value)
      if (noteIndex !== -1) {
        notes.value[noteIndex].title = activeNoteTitle.value
        notes.value[noteIndex].updatedAt = new Date().toISOString()
      }
      
      console.log('History open?', showHistory.value)
      // If history is open, refresh it to show the new version
      if (showHistory.value) {
        console.log('Refreshing history...')
        await fetchHistory()
      }
    }
  } catch (error) { 
    console.error('Failed to save note:', error) 
  } 
  finally { isSaving.value = false }
}

const deleteNote = async (id) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Delete Note?',
    text: "This will delete the note and ALL its version history.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#3f3f46',
    confirmButtonText: 'Yes, delete it',
    background: '#18181b', color: '#fff'
  })

  if (!isConfirmed) return

  try {
    const response = await $fetch(`/api/notes/${id}`, { method: 'DELETE' })
    if (response.success) {
      notes.value = notes.value.filter(n => n.id !== id)
      if (activeNoteId.value === id) {
        if (notes.value.length > 0) await selectNote(notes.value[0].id)
        else {
          activeNoteId.value = null
          activeNoteTitle.value = ''
          rawMarkdown.value = ''
        }
      }
    }
  } catch (error) { console.error('Failed to delete note:', error) }
}

const handleLogout = async () => {
  await $fetch('/api/logout', { method: 'POST' })
  await navigateTo('/login')
}

// --- HISTORY ACTIONS ---
const toggleHistory = () => {
  console.log('Toggle history - currently:', showHistory.value)
  showHistory.value = !showHistory.value
  if (showHistory.value) {
    console.log('History opened, fetching...')
    setTimeout(() => fetchHistory(), 100)
  }
}

const fetchHistory = async () => {
  if (!activeNoteId.value) {
    console.log('No active note ID')
    return
  }
  isLoadingHistory.value = true
  try {
    console.log('Fetching history for note:', activeNoteId.value)
    const response = await $fetch(`/api/notes/${activeNoteId.value}/history`)
    console.log('History response:', response)
    
    if (response.success && response.history) {
      historyVersions.value = response.history
      console.log('Versions loaded:', historyVersions.value.length)
    } else {
      console.warn('No history data in response')
      historyVersions.value = []
    }
  } catch (error) {
    console.error('Failed to fetch history:', error)
    historyVersions.value = []
  } finally {
    isLoadingHistory.value = false
  }
}

const restoreVersion = (version) => {
  const vLabel = `v${version.versionNum}`
  
  // If clicking Latest, just confirm and ensure content is loaded
  if (version.isLatest) {
    // Just make sure we have the current content
    activeNoteTitle.value = version.title
    rawMarkdown.value = version.content
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Already on latest version',
      showConfirmButton: false,
      timer: 1000,
      background: '#18181b',
      color: '#fff'
    })
    return
  }

  // For old versions, ask to restore
  Swal.fire({
    title: `Restore ${vLabel}?`,
    text: "This will load the old content into the editor. Click 'Save Note' to save it.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, restore',
    confirmButtonColor: '#a855f7',
    background: '#18181b',
    color: '#fff'
  }).then(async (result) => {
    if (!result.isConfirmed) return

    try {
      // Fetch version data
      const res = await $fetch(`/api/notes/history/${version.id}`)

      activeNoteTitle.value = res.title
      rawMarkdown.value = res.content

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${vLabel} loaded!`,
        text: 'Click "Save Note" to save it.',
        showConfirmButton: false,
        timer: 1500,
        background: '#18181b',
        color: '#fff'
      })
    } catch (err) {
      console.error('Restore error:', err)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: `Failed to restore ${vLabel}`,
        showConfirmButton: false,
        timer: 1500,
        background: '#18181b',
        color: '#fff'
      })
    }
  })
}

onMounted(() => {
  fetchNotes()
})
</script>

<template>
  <div class="relative h-screen w-full overflow-hidden bg-[#0A0E13] text-zinc-200 flex flex-col">
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute -left-16 bottom-0 h-80 w-80 rounded-full bg-purple-400/18 blur-3xl"></div>
      <div class="absolute right-10 top-10 h-60 w-60 rounded-full bg-purple-300/12 blur-3xl"></div>
      <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent"></div>
    </div>

    <header class="relative z-10 h-16 border-b border-white/10 bg-zinc-950/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 shadow-lg">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
          <div class="h-3 w-3 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]"></div>
        </div>
        <span class="text-sm font-bold tracking-widest uppercase text-white">Note<span class="text-purple-400"> App</span></span>
      </div>
      
      <div class="flex items-center gap-6">
        <button 
          @click="toggleHistory"
          :disabled="!activeNoteId"
          class="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
          :class="{ 'text-purple-400': showHistory }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>
          History
        </button>

        <div class="h-4 w-px bg-white/10 hidden sm:block"></div>
        
        <button 
          @click="saveNote" 
          :disabled="!activeNoteId || isSaving"
          class="text-xs font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
          :class="isSaving ? 'text-zinc-500' : 'text-purple-400 hover:text-purple-300'"
        >
          {{ isSaving ? 'Saving...' : 'Save Note' }}
        </button>
        
        <div class="h-4 w-px bg-white/10"></div>
        <button @click="handleLogout" class="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Log out</button>
      </div>
    </header>

    <div class="relative z-10 flex-1 overflow-hidden p-4 md:p-6 flex gap-4">
      
      <div class="flex-1 rounded-3xl border border-white/10 bg-zinc-950/40 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl overflow-hidden flex flex-col">
        <Splitpanes class="flex-1 h-full w-full custom-splitpanes">
          
          <Pane min-size="15" size="20" max-size="30" class="border-r border-white/10">
            <Sidebar 
              :notes="notes"
              :activeNoteId="activeNoteId"
              @select-note="selectNote"
              @create-note="createNewNote"
              @delete-note="deleteNote"
            />
          </Pane>

          <Pane min-size="20" size="40">
            <Editor 
              :title="activeNoteTitle"
              :content="rawMarkdown"
              @update:title="activeNoteTitle = $event"
              @update:content="rawMarkdown = $event"
            />
          </Pane>

          <Pane min-size="20" size="40" class="border-l border-white/10">
            <Preview :rawMarkdown="rawMarkdown" />
          </Pane>

        </Splitpanes>
      </div>

      <transition name="slide">
        <HistorySidebar 
          v-if="showHistory"
          :versions="historyVersions"
          :isLoading="isLoadingHistory"
          @close="showHistory = false"
          @restore="restoreVersion"
        />
      </transition>

    </div>
  </div>
</template>

<style>
/* Transitions for the sidebar */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; margin-right: 0; opacity: 1; }
.slide-enter-from, .slide-leave-to { margin-right: -17rem; opacity: 0; }

/* Splitpanes Global Overrides */
.splitpanes { background-color: transparent !important; }
.splitpanes.custom-splitpanes { height: 100% !important; display: flex !important; }
.custom-splitpanes .splitpanes__pane { background-color: transparent !important; display: flex !important; flex-direction: column !important; height: 100% !important; }
.splitpanes__pane { background-color: transparent !important; }
.custom-splitpanes .splitpanes__splitter { 
  background-color: rgba(255, 255, 255, 0.02) !important; 
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.05); 
  width: 4px !important; 
  transition: all 0.3s ease; 
  position: relative; 
  z-index: 10;
}
.custom-splitpanes .splitpanes__splitter:hover, .custom-splitpanes .splitpanes__splitter:active { 
  background-color: rgba(168, 85, 247, 0.5) !important;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); 
  width: 6px !important; 
}
.custom-splitpanes .splitpanes__splitter::before { 
  content: ''; 
  position: absolute;
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  height: 30px; 
  width: 2px; 
  background-color: rgba(255, 255, 255, 0.1); 
  border-radius: 4px;
  transition: background-color 0.3s; 
}
.custom-splitpanes .splitpanes__splitter:hover::before { background-color: rgba(255, 255, 255, 0.8); }

/* Scrollbar Styling */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; transition: background-color 0.3s; }
::-webkit-scrollbar-thumb:hover { background-color: rgba(168, 85, 247, 0.5); }
* { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.1) transparent; }
</style>