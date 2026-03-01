#!/bin/bash
# Personal Dashboard - 起動スクリプト
# macOS LaunchAgent から呼び出され、dev server を起動する

# PATH設定（LaunchAgentはデフォルトPATHが限定的なため）
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

PROJECT_DIR="/Users/shige/Antigravity/Personal-dashboard"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/dashboard.log"
PID_FILE="$LOG_DIR/dashboard.pid"
PORT=5173

# ログディレクトリ作成
mkdir -p "$LOG_DIR"

# 既にポートが使用中かチェック（二重起動防止）
if lsof -i :$PORT -sTCP:LISTEN > /dev/null 2>&1; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Port $PORT is already in use. Dashboard may already be running." >> "$LOG_FILE"
    exit 0
fi

# 古いPIDファイルがあればクリーンアップ
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Stopping old process (PID: $OLD_PID)" >> "$LOG_FILE"
        kill "$OLD_PID" 2>/dev/null
        sleep 2
    fi
    rm -f "$PID_FILE"
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Starting Personal Dashboard..." >> "$LOG_FILE"

# プロジェクトディレクトリに移動して npm run dev を実行
cd "$PROJECT_DIR"
npm run dev >> "$LOG_FILE" 2>&1 &
DASHBOARD_PID=$!

# PIDを保存
echo "$DASHBOARD_PID" > "$PID_FILE"
echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Dashboard started (PID: $DASHBOARD_PID)" >> "$LOG_FILE"

# プロセスが終了するまで待機（LaunchAgentが管理するため）
wait "$DASHBOARD_PID"
