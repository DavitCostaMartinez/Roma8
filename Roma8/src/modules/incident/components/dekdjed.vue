
<!----<template>
    <div class="q-pa-md">
      <q-form class="q-gutter-md">
        <label>Titulo de incidencia </label>
        <q-input filled v-model="incident.title" readonly>
          <template v-slot:prepend>
            <q-icon name="title" />
          </template>
        </q-input>
        <br />
        <div class="item-content">
          <label>Descripción </label> <br />
          <textarea
            :value="incident.description"
            class="full-width with-border"
            readonly
          ></textarea>
        </div>
        <q-input color="teal" filled v-model="incident.date" readonly>
          <template v-slot:prepend>
            <q-icon name="event" />
          </template>
        </q-input>
        <div>
          <img :src="imageUrl" alt="Descripción de la imagen" />
        </div>
      </q-form>
    </div>
  </template>

<EssentialIncident
v-for="select in selectedIncident"
:key="select.id"
:select="select"
>

<EssentialIncident v-if="isOpen" @on:close="closeModal">
      <template v-slot:body>
        <div class="body-container">
          <p>{{ selectedIncident.description }}</p>
        </div>
        <div class="photo-container">
          <img
            :src="selectedIncident.photo"
            alt="Descripción de la imagen"
            style="border-radius: 40px; max-width: 100%; max-height: 200px"
          />
        </div>
      </template>
      <template v-slot:footer>
        <div class="button-container">
          <button class="button-footer" @click="closeModal">Salir</button>
        </div>
      </template>
      <template v-slot:header>
        <h2 class="text-header">{{ selectedIncident.title }}</h2>
      </template>
    </EssentialIncident>




<q-dialog v-model="card">
  <q-card class="my-card">
    <q-img src="https://cdn.quasar.dev/img/chicken-salad.jpg" />

    <q-card-section>
      <q-btn
        fab
        color="primary"
        icon="place"
        class="absolute"
        style="top: 0; right: 12px; transform: translateY(-50%);"
      />

      <div class="row no-wrap items-center">
        <div class="col text-h6 ellipsis">
          Cafe Basilico
        </div>
        <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
          <q-icon name="place" />
          250 ft
        </div>
      </div>

      <q-rating v-model="stars" :max="5" size="32px" />
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="text-subtitle1">
        $・Italian, Cafe
      </div>
      <div class="text-caption text-grey">
        Small plates, salads & sandwiches in an intimate setting.
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn v-close-popup flat color="primary" label="Reserve" />
      <q-btn v-close-popup flat color="primary" round icon="event" />
    </q-card-actions>
  </q-card>
</q-dialog>-->