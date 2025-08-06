<script setup>
defineProps({
  modelValue: String,
  name: String,
  label: String,
  placeholder: String,
  rows: { type: Number, default: 3 },
  error: String,
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="form-group mb-3">
    <label :for="name" class="form-label">{{ label }}</label>
    <textarea
      :id="name"
      :name="name"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
      :rows="rows"
    ></textarea>
    <div v-if="error" class="invalid-feedback">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.form-control {
  font-size: 16px;
}
</style>
