/* eslint-env node */
const { configure } = require('quasar/wrappers');
const path = require('path');

module.exports = configure(function (/* ctx */) {
  return {
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
      plugins: []
    },

    boot: [
      'i18n',
      'axios',
      'google-maps'
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
      vitePlugins: [
        ['@intlify/vite-plugin-vue-i18n', {
          include: path.resolve(__dirname, './src/i18n/**')
        }],
        ['vite-plugin-checker', {
          eslint: {
            lintCommand: 'eslint "./**/*.{js,mjs,cjs,vue}"'
          }
        }, { server: false }]
      ]
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
