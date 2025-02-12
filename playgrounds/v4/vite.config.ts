import tailwindcss from '@tailwindcss/vite'
import type { UserConfig } from 'vite'
import { icons } from 'tailwindcss-plugin-icons'

export default { plugins: [tailwindcss(), icons()] } satisfies UserConfig
