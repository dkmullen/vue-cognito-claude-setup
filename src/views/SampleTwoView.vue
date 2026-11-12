<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import axios from 'axios'
import { getItems } from '@/api/sampleApi'
import { ApiError } from '@/util/errors'

// Demonstrates loading data through the shared axios instance,
// with loading/error states and cancellation when the page unmounts.
const items = ref([])
const loading = ref(false)
const error = ref(null)
let controller = null

async function load() {
  controller?.abort()
  controller = new AbortController()
  loading.value = true
  error.value = null
  try {
    items.value = await getItems({ signal: controller.signal })
  } catch (err) {
    if (axios.isCancel(err)) return
    error.value = err instanceof ApiError ? err.message : 'Failed to load items.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <v-card>
    <v-card-title class="text-h5">Sample Two</v-card-title>
    <v-card-text>
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-alert v-else-if="error" type="error" variant="tonal" :text="error">
        <template #append>
          <v-btn variant="text" @click="load">Retry</v-btn>
        </template>
      </v-alert>

      <v-list v-else-if="items.length">
        <v-list-item v-for="item in items" :key="item.id" :title="item.name" />
      </v-list>

      <p v-else>No items.</p>
    </v-card-text>
  </v-card>
</template>
