<script setup>
defineProps({
  modelValue: String,
  name: String,
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  error: String,
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="form-group mb-3">
    <label :for="name" class="form-label">{{ label }}</label>
    <input
      :id="name"
      :name="name"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
    />
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
