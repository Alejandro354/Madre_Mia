const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Returns an error message if the file is invalid, or null if it's a valid JPG/PNG under 5MB.
export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato no válido. Solo se permiten imágenes JPG o PNG.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'La imagen supera el tamaño máximo permitido de 5MB.';
  }
  return null;
}
