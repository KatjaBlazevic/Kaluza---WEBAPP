/* eslint-env node */
const { configure } = require('quasar/wrappers');
const path = require('path');

module.exports = configure(function (/* ctx */) {
  return {
    // ... ostale konfiguracije ...

    framework: {
      iconSet: 'material-icons',
      config: {
        brand: {
          primary: '#3C284B',
          secondary: '#C7D7FB',
          accent: '#8F89B7',
          dark: '#2E3B4E',
          textdark: '#2E3B4E',
          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037'
        }
      },
      plugins: [
        'Meta'
      ]
    },

    boot: [
      'i18n',
      'axios',
      'google-maps',
      'pinia'
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'fontawesome-v6',
      'roboto-font',
      'material-icons'
    ],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20'
      },
      vueRouterMode: 'hash',
  rawHtmlHead: `
        <title>Pets&Care</title>
        <meta name="description" content="Službena web stranica za ljubimce.">
        <meta name="keywords" content="web development, ljubimci, pets, care, briga, Quasar, veterinari, dogadaji za ljubimce">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="https://www.tvoj-objavljeni-url.com/"> <meta property="og:title" content="Pets&Care">
        <meta property="og:description" content="Briga za tvoje ljubimce na jednom mjestu!">
        <meta property="og:image" content="https://www.tvoj-objavljeni-url.com/Pets&Care - logo.svg"> <meta property="og:url" content="https://www.tvoj-objavljeni-url.com/"> <meta property="og:type" content="website">
        <meta property="og:locale" content="hr_HR">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Pets&Care - Briga za tvoje ljubimce">
        <meta name="twitter:description" content="Otkrij sve o brizi za ljubimce, veterinarima i događajima na Pets&Care!">
        <meta name="twitter:image" content="https://www.tvoj-objavljeni-url.com/Pets&Care - logo.svg"> <script async src="https://www.googletagmanager.com/gtag/js?id=G-H4CDCPX6WL"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-H4CDCPX6WL'); // <-- VAŽNO: ZAMIJENI OVO SVOJIM STVARNIM GA4 MEASUREMENT ID-JEM (npr. G-ABCDE12345)
        </script>
      `,
      vitePlugins: [
        ['@intlify/vite-plugin-vue-i18n', {
          include: path.resolve(__dirname, './src/i18n/**')
        }],
        ['vite-plugin-checker', {
          eslint: {
            lintCommand: 'eslint "./**/*.{js,mjs,cjs,vue}"'
          }
        }, { server: false }]
      ],
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },

    devServer: {
      open: true
    },

    animations: [],

    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [
        'render'
      ]
    },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false
    },

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'quasar-project'
      }
    },

    bex: {
      contentScripts: [
        'my-content-script'
      ]
    }
  };
});
