<script setup>
import { mdiHome, mdiInformation, mdiViewList } from '@mdi/js'

// Single source of truth for the menu. Add a page here and a route in
// src/router/index.js.
const items = [
  { title: 'Home', to: '/', icon: mdiHome },
  { title: 'Sample One', to: '/sample-one', icon: mdiInformation },
  { title: 'Sample Two', to: '/sample-two', icon: mdiViewList },
]
</script>

<template>
  <v-list nav density="compact">
    <v-list-item
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :title="item.title"
      :prepend-icon="`svg:${item.icon}`"
      color="primary"
    />
  </v-list>
</template>
