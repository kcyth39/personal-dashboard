import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

import tailwindcss from '@tailwindcss/vite'

// データ更新プラグイン: dev server起動時にupdate-data.jsをバックグラウンド実行
function dataUpdaterPlugin() {
  let child = null;
  return {
    name: 'data-updater',
    configureServer() {
      console.log('\n🔄 Starting data updater (market, news, weather)...\n');
      child = spawn('node', ['scripts/update-data.js'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        detached: false
      });

      child.on('error', (err) => {
        console.error('❌ Data updater failed to start:', err.message);
      });

      // サーバー終了時にクリーンアップ
      const cleanup = () => {
        if (child && !child.killed) {
          child.kill();
        }
      };
      process.on('exit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
    }
  };
}

// 設定ファイル保存用プラグイン
function configApiPlugin() {
  return {
    name: 'config-api',
    configureServer(server) {
      server.middlewares.use('/api/config', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const newConfig = JSON.parse(body);
              const configPath = path.resolve(process.cwd(), 'public/data/dashboard-config.json');
              fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 4), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), dataUpdaterPlugin(), configApiPlugin()],
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/public/data/**']
    }
  }
})
