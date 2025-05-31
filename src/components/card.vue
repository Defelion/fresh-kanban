<script setup lang="ts">
  defineProps<{
    cardValue: { title: string, description: string }
  }>()

  const emit = defineEmits<{
    (e: 'update:cardValue', value: { title: string, description: string }): void
  }>()
</script>

<template>
  <v-card
    class="mx-auto"
    draggable="true"
    elevation="5"
    width="100%"
  >
    <v-container class="justify-center align-center">
      <v-text-field
        v-model="cardValue.title"
        class="mt-5"
        density="compact"
        label="title"
        variant="underlined"
        @input="emit('update:cardValue', cardValue)"
      />
      <v-textarea
        v-model="cardValue.description"
        auto-grow
        label="Beskrivelse"
        variant="underlined"
        @input="emit('update:cardValue', cardValue)"
      />

    </v-container>
  </v-card>
</template>

<style scoped lang="sass">
</style>
