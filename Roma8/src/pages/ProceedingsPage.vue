<template>
  <div>
    <div v-if="pdf" ref="pdfContainer" class="pdf-container"></div>

    <ul>
      <li v-for="(pdfItem, index) in pdfList" :key="index">
        <a :href="pdfItem.url" target="_blank">{{ pdfItem.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref } from "vue";
import { storage } from "../boot/firebase";

export default {
  setup() {
    const pdf = ref(null);
    const selectedPdf = ref("");
    const pdfList = ref([]);
    const storageRef = storage.ref().child("actas");

    const fetchPdfList = async () => {
      try {
        const res = await storageRef.listAll();
        const items = await Promise.all(
          res.items.map(async (itemRef) => {
            const url = await itemRef.getDownloadURL();
            return { name: itemRef.name, url };
          })
        );
        pdfList.value = items;
      } catch (error) {
        console.error("Error fetching PDF list:", error);
      }
    };

    const loadPdf = async (url) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        pdf.value = blob;
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    const onPdfSelect = (event) => {
      const selectedUrl = event.target.value;
      loadPdf(selectedUrl);
    };

    fetchPdfList();

    return {
      pdf,
      selectedPdf,
      pdfList,
      onPdfSelect,
    };
  },
};
</script>

<style scoped>
a:hover {
  color: black;
}
</style>