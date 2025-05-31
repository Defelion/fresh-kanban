<script setup lang="ts">

</script>

<template>
  <v-container>
    <v-row>
      <v-col class="col1">
        <v-text-field
          class="mt-5"
          density="compact"
          label="Status Kolonne 1"
          variant="underlined"
        />
      </v-col>
      <v-col>
        <v-text-field
          class="mt-5"
          density="compact"
          label="Status Kolonne 2"
          variant="underlined"
        />
      </v-col>
      <v-col>
        <v-text-field
          class="mt-5"
          density="compact"
          label="Status Kolonne 3"
          variant="underlined"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <card />
      </v-col>
      <v-col>
        <card />
      </v-col>
      <v-col>
        <card />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="sass">

</style>
