export const getApiErrorMessages = (
  error,
  fallback = "Ocurrió un error inesperado. Intenta de nuevo.",
) => {
  const response = error?.response;

  if (!response) {
    return [
      "No se pudo conectar con el servidor. Verifica que la API esté en ejecución.",
    ];
  }

  const data = response.data;

  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat().filter(Boolean);
    if (messages.length > 0) {
      return messages;
    }
  }

  if (typeof data?.message === "string") {
    return [data.message];
  }

  if (typeof data?.detail === "string") {
    return [data.detail];
  }

  if (typeof data?.title === "string") {
    return [data.title];
  }

  return [fallback];
};
