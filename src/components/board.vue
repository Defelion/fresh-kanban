<script setup lang="ts">
  import { ref } from 'vue'
  import Column from '@/components/column.vue'

  const columns = ref([
    { id: '1', cards: ['Card 1'] },
  ])

  function addColumn () {
    const nextId = `${columns.value.length + 1}`
    columns.value.push({ id: nextId })
  }

  function removeColumn (id: string) {
    columns.value = columns.value.filter(col => col.id !== id)
  }
</script>

<template>
  <v-container fluid>
    <v-row v-if="columns.length > 0">
      <v-col
        v-for="(col) in columns"
        :key="col.id"
      >
        <column :colum-id="col.id" @remove="removeColumn" />
      </v-col>
      <v-col cols="auto">
        <v-btn
          height="100%"
          value="addColumn"
          variant="tonal"
          @click="addColumn"
        >
          <v-icon size="x-large">mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-btn
          height="100%"
          min-height="365px"
          value="addColumn"
          variant="tonal"
          width="100%"
          @click="addColumn"
        >
          <v-icon size="x-large">mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="sass">

</style>
