import { defineConfig } from 'vite';
import { ChemicalVitePlugin } from "chemicaljs";

export default defineConfig({
  base: '/',
  plugins: [
    [ChemicalVitePlugin({})],
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
