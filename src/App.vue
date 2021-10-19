<template>
  <v-app>
    <v-main>
      <div class="ml-1 mr-2">
          <AutoTable api="https://coronavirusapi-france.vercel.app/AllDataByDate?date=2020-09-30" array_data="allFranceDataByDate"/>
      </div>
    </v-main>
  </v-app>
</template>

<style lang="scss">
  a:link {
    text-decoration: none;
  }

</style>

<script>
import AutoTable from "./components/AutoTable";

export default {
  name: 'App',

  components: {
    AutoTable,
  },
  data() {
    return {
      appVersion: process.env.VUE_APP_VERSION,
      appName: process.env.VUE_APP_NAME,
    }
  },
  methods: {
  },
  mounted() {
  },
};
</script>
