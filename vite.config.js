import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

import tailwindcss from '@tailwindcss/vite'

// オンダマンド・データ更新用プラグイン
function refreshApiPlugin() {
  let isUpdating = false;

  return {
    name: 'refresh-api',
    configureServer(server) {
      server.middlewares.use('/api/refresh', (req, res, next) => {
        if (req.method !== 'GET') {
          return next();
        }

        // すでに更新中の場合はそのまま返す
        if (isUpdating) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          return res.end(JSON.stringify({ status: 'updating' }));
        }

        // dashboard-data.json の最終更新時間を確認（2分以内の更新ならスキップ）
        const dataPath = path.resolve(process.cwd(), 'public/data/dashboard-data.json');
        try {
          if (fs.existsSync(dataPath)) {
            const stats = fs.statSync(dataPath);
            const ageMs = Date.now() - stats.mtimeMs;
            if (ageMs < 2 * 60 * 1000) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              return res.end(JSON.stringify({ status: 'fresh', age: ageMs }));
            }
          }
        } catch (e) {
          // エラー時はフェッチを実行
        }

        console.log(`\n🔄 [Refresh API] Triggering data update...`);
        isUpdating = true;

        const child = spawn('node', ['scripts/update-data.js'], {
          cwd: process.cwd(),
          stdio: 'inherit'
        });

        child.on('close', (code) => {
          isUpdating = false;
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'updated', success: code === 0 }));
        });

        child.on('error', (err) => {
          isUpdating = false;
          console.error('❌ Data updater failed:', err.message);
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ status: 'error', error: err.message }));
        });
      });
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
  plugins: [react(), tailwindcss(), refreshApiPlugin(), configApiPlugin()],
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/public/data/**']
    }
  }
})
