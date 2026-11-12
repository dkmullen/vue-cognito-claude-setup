import { createVuetify } from 'vuetify'
import { mdi } from 'vuetify/iconsets/mdi-svg'
import { iconAliases } from '@/lib/icons'

// Vuetify components are auto-imported by vite-plugin-vuetify.
// Icons come from @mdi/js (see src/lib/icons.js) rendered as inline SVG,
// instead of loading the full MDI icon font.
export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: iconAliases,
    sets: { mdi },
  },
})
