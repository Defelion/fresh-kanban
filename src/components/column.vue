<script setup lang="ts">
  const prop = defineProps<{ columId: string }>()

  const emit = defineEmits<{
    (e: 'remove', id: string): void
  }>()

  function removeColumn () {
    emit('remove', prop.columId)
  }
</script>

<template>
  <v-row no-gutters>
    <v-col>
      <v-text-field
        id="{{ columId }}"
        class="mt-3"
        density="compact"
        label="Status Kolonne"
        variant="underlined"
      />
    </v-col>
    <v-col cols="auto">
      <v-btn
        class="mt-6"
        color="error"
        icon
        size="extra-small"
        variant="text"
        @click="removeColumn"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <card />
    </v-col>
  </v-row>
</template>

<style scoped lang="sass">

</style>
