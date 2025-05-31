<script setup lang="ts">

  import Card from '@/components/card.vue';
</script>

<template>
  <v-container>
    <v-row>
      <v-spacer />
      <v-col>
        <v-text-field label="Board Number" min-width="400" variant="solo-filled" />
      </v-col>
      <v-spacer />
    </v-row>
  </v-container>
  <card />
</template>

<style scoped lang="sass">

</style>
