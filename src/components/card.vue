<script setup lang="ts">

</script>

<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card
      class="mx-auto"
      elevation="5"
      width="100%"
    >
      <v-container class="justify-center align-center">
        <v-text-field
          class="mt-5"
          density="compact"
          label="title"
          variant="underlined"
        />
        <v-textarea
          label="Beskrivelse"
          auto-grow
          variant="underlined"
        />

      </v-container>
    </v-card>
  </v-container>
</template>

<style scoped lang="sass">
</style>
