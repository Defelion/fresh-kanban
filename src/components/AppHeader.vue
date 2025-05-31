<script setup lang="ts">
  import { useTheme } from 'vuetify'

  const theme = useTheme()

  function toggleTheme () {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  }
</script>

<template>
  <v-app-bar>
    <v-container class="d-flex justify-center align-center">
      <v-row align="center" justify="center" no-gutters>
        <v-col cols="auto">
          <v-app-bar-title class="text-center">Fresh Kanban</v-app-bar-title>
        </v-col>
        <v-col>
          <v-spacer />
          <v-text-field
            class="mx-4 mt-4"
            density="compact"
            label="Board Number"
            min-width="300"
            variant="underlined"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            class="mt-2"
            @click="toggleTheme"
          >
            toggle theme
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<style scoped lang="sass">

</style>
