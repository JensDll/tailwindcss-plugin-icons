<script setup lang="ts"></script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-12">
    <h1 class="text-5xl font-bold">Icons</h1>
    <section class="mt-6 flex space-x-2">
      <div class="i-heroicons-solid-trash h-8 w-8 hover:text-purple-500"></div>
      <div
        class="bg-heroicons-outline-trash-emerald-500 hover:bg-heroicons-outline-trash-emerald-300 h-8 w-8"
      ></div>
      <div
        class="i-heroicons-outline-lock-closed hover:i-heroicons-outline-lock-open h-8 w-8"
      ></div>
      <div
        class="i-custom-loading firefox-border-animation-fix h-8 w-8 animate-spin text-orange-600"
      ></div>
      <div class="i-brandico-facebook h-8 w-8 text-[#1178f2]"></div>
      <div
        class="i-vscode-icons-file-type-light-db h-8 w-8 text-pink-500"
      ></div>
    </section>
    <section class="flex space-x-2">
      <div class="i-line-md-align-left h-8 w-8"></div>
      <div class="i-line-md-align-right h-8 w-8"></div>
      <div class="i-line-md-arrow-align-bottom h-8 w-8"></div>
      <div class="i-line-md-downloading-loop h-8 w-8"></div>
      <div class="i-logos-ember-tomster foo h-16 w-16"></div>
      <div class="i-logos-emmet h-12 w-12"></div>
      <div class="i-flat-ui-mic h-8 w-8"></div>
    </section>
    <section class="flex space-x-2">
      <div class="i-openmoji-dolphin h-[72px] w-[72px]"></div>
      <div class="i-openmoji-snake h-[72px] w-[72px]"></div>
      <div class="i-openmoji-cat h-[72px] w-[72px]"></div>
    </section>
  </section>
</template>

<style scoped>
.foo {
  transform: rotate(270deg);
}
</style>
