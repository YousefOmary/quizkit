import { defineConfig } from 'vite';

/**
 * base './' is required so the built app works from a GitHub Pages
 * project subpath (username.github.io/quizkit/) and inside Capacitor,
 * which serves the bundle from a non-root path on device.
 */
export default defineConfig({
  base: './',
});
