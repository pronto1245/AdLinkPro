/** PostCSS config под CommonJS, чтобы Netlify/Vite не ругались */
module.exports = {
  plugins: {
    // Явно укажем путь к tailwind.config.* внутри client/
    tailwindcss: { config: './client/tailwind.config.ts' },
    autoprefixer: {},
  },
};
