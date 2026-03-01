import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), dataUpdaterPlugin()],
  server: {
    watch: {
      ignored: ['**/public/data/**']
    }
  }
})
