// Chaîne PostCSS: TailwindCSS + autoprefixer
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// Exporte la configuration PostCSS
export default {
  plugins: [tailwindcss(), autoprefixer()],
}
