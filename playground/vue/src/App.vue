<script setup lang="ts"></script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-12">
    <ul class="icons">
      <li
        class="bg-heroicons-outline-trash-purple-500 hover:bg-heroicons-outline-trash-purple-700"
      ></li>
      <li
        class="i-heroicons-solid-trash text-slate-400 hover:text-slate-600"
      ></li>
      <li class="i-heroicons-outline-plus-circle"></li>
      <li class="i-heroicons-outline-minus-circle"></li>
      <li
        class="i-heroicons-outline-lock-closed hover:i-heroicons-outline-lock-open"
      ></li>
      <li
        class="i-custom-loading firefox-border-animation-fix animate-spin text-orange-500"
      ></li>
      <li
        class="i-custom-local-loading firefox-border-animation-fix animate-spin text-fuchsia-500"
      ></li>
      <li class="i-line-md-align-left"></li>
      <li class="i-line-md-align-right"></li>
      <li class="i-line-md-arrow-align-top text-lime-500"></li>
      <li class="i-line-md-arrow-align-right text-sky-500"></li>
      <li class="i-line-md-arrow-align-bottom"></li>
      <li class="i-line-md-arrow-align-left"></li>
      <li class="i-vscode-icons-file-type-light-db text-pink-500"></li>
      <li class="i-logos-ember-tomster"></li>
      <li class="i-logos-vue"></li>
      <li class="i-logos-stackblitz"></li>
      <li class="i-logos-cardano"></li>
      <li class="i-logos-stackoverflow"></li>
    </ul>
  </section>
</template>

<style scoped>
.icons {
  @apply flex flex-wrap items-center text-2xl;
}

.icons > li {
  @apply m-2 shrink-0;
}
</style>
