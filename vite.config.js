
import path from 'path'
import { defineConfig } from 'vite'
import glob from 'fast-glob'
import { fileURLToPath } from 'url'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import injectHTML from 'vite-plugin-html-inject';
import createSvgSpritePlugin from 'vite-plugin-svg-spriter';
import { createHtmlPlugin } from 'vite-plugin-html';

const SRC_PATH = path.resolve(__dirname, 'src')
const SVG_FOLDER_PATH = path.resolve(SRC_PATH, 'img', 'svg-sprite')

export default defineConfig({
	base: '',

	// server: {
	// 	proxy: {
	// 		'/api': {
	// 			target: 'https://letu.wim.agency/',
	// 			changeOrigin: true,
	// 			// rewrite: (path) => path.replace(/^\/api/, '')
	// 		},
	// 	},
	// },

	plugins: [
		createSvgSpritePlugin({
			svgFolder: SVG_FOLDER_PATH,
			svgSpriteConfig: {
				shape: {
					transform: ['svgo'],
				},
			},
			transformIndexHtmlTag: {
				injectTo: 'body',
			},
		}),

		injectHTML(),


		ViteImageOptimizer({
			svg: {
				plugins: [
					'removeDoctype',
					'removeXMLProcInst',
					'minifyStyles',
					'sortAttrs',
					'sortDefsChildren',
				],
			},
			png: {
				quality: 70,
			},
			jpeg: {
				quality: 70,
			},
			jpg: {
				quality: 70,
			},
			webp: {
				quality: 80,
			},
			avif: {
				quality: 80,
			},
		}),

		createHtmlPlugin({
			minify: true
		}),

	],
	build: {
		rollupOptions: {
			input: Object.fromEntries(
				glob.sync(['./*.html', './pages/**/*.html']).map(file => [
					path.relative(__dirname, file.slice(0, file.length - path.extname(file).length)),
					fileURLToPath(new URL(file, import.meta.url))
				])
			)
		},
	},
	css: {
		devSourcemap: true,
	},

})