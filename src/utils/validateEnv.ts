export function validateEnv(): void {
  const required = ["VITE_CDP_API_KEY_NAME", "VITE_CDP_API_KEY_PRIVATE_KEY"];
  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
