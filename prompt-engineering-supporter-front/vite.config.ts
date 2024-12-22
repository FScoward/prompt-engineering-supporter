import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "process.env.GOOGLE_API_KEY": JSON.stringify(env.GOOGLE_API_KEY),
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@google/generative-ai": path.resolve(
          __dirname,
          "./node_modules/@google/generative-ai/dist/index.js"
        ),
      },
    },
  };
});
