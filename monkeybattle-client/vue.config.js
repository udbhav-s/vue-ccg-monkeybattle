/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  outputDir: path.resolve(__dirname, "../monkeybattle-server/public"),
  lintOnSave: false,
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000/",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:3000/",
        ws: true,
        // pathRewrite: {
        //   "/socket.io": ""
        // }
      },
    },
  },
};
