<script setup>
import { ref } from 'vue'

// Demo of a Vuetify form control; its dropdown arrow is served from @mdi/js.
const fruits = ['Apple', 'Banana', 'Cherry']
const selected = ref(null)
</script>

<template>
  <v-card>
    <v-card-title class="text-h5">Sample One</v-card-title>
    <v-card-text>
      <v-select
        v-model="selected"
        :items="fruits"
        label="Pick a fruit"
        variant="outlined"
        clearable
        style="max-width: 360px"
      />
      <p v-if="selected">You picked: {{ selected }}</p>
    </v-card-text>
  </v-card>
</template>
