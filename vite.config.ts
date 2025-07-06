import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: { include: ["jspdf", "jspdf-autotable"] },
  ssr: { noExternal: ["jspdf", "jspdf-autotable"] },
  // ... outras configs ...
});
