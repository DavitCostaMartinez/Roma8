<template>
  <div>
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      style="border: 1px solid black"
    ></canvas>
    <div style="display: flex; justify-content: flex-end">
      <q-btn
        color="inherit"
        :style="{ backgroundColor: userColors?.Diseño?.color, margin: '5px' }"
        @click="clearSignature"
        >limpiar firma</q-btn
      >
      <q-btn
        color="inherit"
        :style="{ backgroundColor: userColors?.Diseño?.color, margin: '5px' }"
        @click="saveSignature"
        >Guardar firma</q-btn
      >
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import SignaturePad from "signature_pad";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();
    const canvas = ref(null);
    const signaturePad = ref(null);
    const canvasWidth = 550;
    const canvasHeight = 200;
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const today = ref(new Date().toISOString().split("T")[0]);
    const useredit = computed(() => store.getters["authModule/getUserDB"]);
    // Método para inicializar SignaturePad
    const initSignaturePad = () => {
      const canvasElement = canvas.value;
      if (canvasElement) {
        signaturePad.value = new SignaturePad(canvasElement, {
          minWidth: 2,
          maxWidth: 4,
          penColor: "black",
          backgroundColor: "white",
        });
      }
    };

    // Método para limpiar la firma
    const clearSignature = () => {
      if (signaturePad.value) {
        signaturePad.value.clear();
      }
    };

    // Método para guardar la firma
    const saveSignature = async () => {
      if (signaturePad.value) {
        const signatureData = signaturePad.value.toDataURL();
        let body = {
          date: today.value,
          id: useredit.value.id,
          signature: signatureData,
        };
        console.log(signatureData);
        await store.dispatch("authModule/savesignature", body);
      }
    };

    // Llamar a la función de inicialización cuando el componente se monta
    onMounted(initSignaturePad);

    return {
      canvas,
      canvasWidth,
      canvasHeight,
      clearSignature,
      saveSignature,
      useredit,
      userColors,
    };
  },
};
</script>
