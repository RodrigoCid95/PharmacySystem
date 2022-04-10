// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
module.exports = {
  packagerConfig: {
    executableName: 'Farmacia de Jesús',
    name: 'Farmacia de Jesús',
    icon: path.resolve(__dirname, 'app.ico'),
    asar: true,
    win32metadata: {
      FileDescription: 'Sistema de ventas, Farmacia de Jesús'
    }
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "pharmacy-system",
        setupExe: "Farmacia de Jesús.exe",
        iconUrl: `file:///${path.resolve(__dirname, 'app.ico')}`,
        author: 'Rodrigo Cid'
      }
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          categories: ["Utility"]
        }
      }
    }
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        devServer: {
          hot: true,
          historyApiFallback: true
        },
        mainConfig: "./webpack.main.config.js",
        nodeIntegration: true,
        contextIsolation: true,
        webSecurity: false,
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/login/index.html",
              js: "./src/login/renderer.tsx",
              preload: {
                js: "./src/login/API.ts"
              },
              name: "login_window"
            },
            {
              html: "./src/admin/index.html",
              js: "./src/admin/renderer.tsx",
              preload: {
                js: "./src/admin/API/index.ts"
              },
              name: "admin_window"
            },
            {
              html: "./src/checkout-box/index.html",
              js: "./src/checkout-box/renderer.tsx",
              preload: {
                js: "./src/checkout-box/API/index.ts"
              },
              name: "checkout_box_window"
            }
          ]
        }
      }
    ]
  ]
}