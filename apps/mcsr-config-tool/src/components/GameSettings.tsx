import { useConfigStore } from '../store/useConfigStore';

export function GameSettings() {
  const gameSettings = useConfigStore((state) => state.gameSettings);
  const updateGameSetting = useConfigStore((state) => state.updateGameSetting);

  return (
    <div className="space-y-6">
      {/* Video Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b border-gray-300 dark:border-gray-600 pb-2">
          ビデオ設定
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FOV */}
          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>視野角 (FOV)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="30"
                  max="110"
                  step="1"
                  value={gameSettings.fov}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 30 && val <= 110) {
                      updateGameSetting('fov', val);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary min-w-[3rem]">
                  {gameSettings.fov === 70 ? '標準' : gameSettings.fov === 110 ? '最大' : ''}
                </span>
              </div>
            </label>
            <input
              type="range"
              min="30"
              max="110"
              step="1"
              value={gameSettings.fov}
              onChange={(e) => updateGameSetting('fov', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Render Distance */}
          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>描画距離</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="2"
                  max="32"
                  step="1"
                  value={gameSettings.renderDistance}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 2 && val <= 32) {
                      updateGameSetting('renderDistance', val);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">チャンク</span>
              </div>
            </label>
            <input
              type="range"
              min="2"
              max="32"
              step="1"
              value={gameSettings.renderDistance}
              onChange={(e) => updateGameSetting('renderDistance', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Max FPS */}
          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>最大FPS</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="10"
                  max="260"
                  step="10"
                  value={gameSettings.maxFps}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 10 && val <= 260) {
                      updateGameSetting('maxFps', val);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary min-w-[4rem]">
                  {gameSettings.maxFps === 260 ? '無制限' : ''}
                </span>
              </div>
            </label>
            <input
              type="range"
              min="10"
              max="260"
              step="10"
              value={gameSettings.maxFps}
              onChange={(e) => updateGameSetting('maxFps', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Gamma (Brightness) */}
          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>明るさ</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round((gameSettings.gamma / 5) * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateGameSetting('gamma', (val / 100) * 5);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={gameSettings.gamma}
              onChange={(e) => updateGameSetting('gamma', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Graphics Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary block">グラフィックス</label>
            <select
              value={gameSettings.graphicsMode}
              onChange={(e) => updateGameSetting('graphicsMode', parseInt(e.target.value))}
              className="select-base w-full"
            >
              <option value="0">高速</option>
              <option value="1">普通</option>
              <option value="2">描画優先</option>
            </select>
          </div>

          {/* Particles */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary block">パーティクル</label>
            <select
              value={gameSettings.particles}
              onChange={(e) => updateGameSetting('particles', parseInt(e.target.value))}
              className="select-base w-full"
            >
              <option value="0">すべて</option>
              <option value="1">少し</option>
              <option value="2">最小</option>
            </select>
          </div>

          {/* GUI Scale */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary block">GUIサイズ</label>
            <select
              value={gameSettings.guiScale.value}
              onChange={(e) => updateGameSetting('guiScale', { ...gameSettings.guiScale, value: parseInt(e.target.value) })}
              className="select-base w-full"
            >
              <option value="0">自動</option>
              <option value="1">小</option>
              <option value="2">通常</option>
              <option value="3">大</option>
              <option value="4">最大</option>
            </select>
          </div>

          {/* Entity Distance Scaling */}
          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>エンティティ距離</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="10"
                  max="100"
                  step="5"
                  value={Math.round((gameSettings.entityDistanceScaling / 5) * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 10 && val <= 100) {
                      updateGameSetting('entityDistanceScaling', (val / 100) * 5);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.25"
              value={gameSettings.entityDistanceScaling}
              onChange={(e) => updateGameSetting('entityDistanceScaling', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => updateGameSetting('fullscreen', !gameSettings.fullscreen)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.fullscreen
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            フルスクリーン: <span className="font-bold">{gameSettings.fullscreen ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('enableVsync', !gameSettings.enableVsync)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.enableVsync
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            VSync: <span className="font-bold">{gameSettings.enableVsync ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('bobView', !gameSettings.bobView)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.bobView
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            画面の揺れ: <span className="font-bold">{gameSettings.bobView ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('entityShadows', !gameSettings.entityShadows)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.entityShadows
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            エンティティの影: <span className="font-bold">{gameSettings.entityShadows ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('renderClouds', gameSettings.renderClouds !== 0 ? 0 : 2)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.renderClouds !== 0
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            雲の描画: <span className="font-bold">{gameSettings.renderClouds !== 0 ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </section>

      {/* Mouse Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b border-gray-300 dark:border-gray-600 pb-2">
          マウス設定
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mouse Sensitivity */}
          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>マウス感度</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={gameSettings.mouseSensitivity.toFixed(2)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 1) {
                      updateGameSetting('mouseSensitivity', val);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary min-w-[4rem]">
                  ({(gameSettings.mouseSensitivity * 200).toFixed(0)}%)
                </span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gameSettings.mouseSensitivity}
              onChange={(e) => updateGameSetting('mouseSensitivity', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Mouse Wheel Sensitivity */}
          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>ホイール感度</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="10"
                  max="200"
                  step="10"
                  value={(gameSettings.mouseWheelSensitivity * 100).toFixed(0)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 10 && val <= 200) {
                      updateGameSetting('mouseWheelSensitivity', val / 100);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={gameSettings.mouseWheelSensitivity}
              onChange={(e) => updateGameSetting('mouseWheelSensitivity', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => updateGameSetting('rawMouseInput', !gameSettings.rawMouseInput)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.rawMouseInput
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Raw Input: <span className="font-bold">{gameSettings.rawMouseInput ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('invertYMouse', !gameSettings.invertYMouse)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.invertYMouse
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Y軸反転: <span className="font-bold">{gameSettings.invertYMouse ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('touchscreen', !gameSettings.touchscreen)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.touchscreen
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            タッチスクリーン: <span className="font-bold">{gameSettings.touchscreen ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </section>

      {/* Sound Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b border-gray-300 dark:border-gray-600 pb-2">
          サウンド設定
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>マスター音量</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(gameSettings.soundCategory_master * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateGameSetting('soundCategory_master', val / 100);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gameSettings.soundCategory_master}
              onChange={(e) => updateGameSetting('soundCategory_master', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>音楽</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(gameSettings.soundCategory_music * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateGameSetting('soundCategory_music', val / 100);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gameSettings.soundCategory_music}
              onChange={(e) => updateGameSetting('soundCategory_music', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>ブロック</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(gameSettings.soundCategory_block * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateGameSetting('soundCategory_block', val / 100);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gameSettings.soundCategory_block}
              onChange={(e) => updateGameSetting('soundCategory_block', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>敵対的生物</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(gameSettings.soundCategory_hostile * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateGameSetting('soundCategory_hostile', val / 100);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gameSettings.soundCategory_hostile}
              onChange={(e) => updateGameSetting('soundCategory_hostile', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>友好的生物</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(gameSettings.soundCategory_neutral * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateGameSetting('soundCategory_neutral', val / 100);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gameSettings.soundCategory_neutral}
              onChange={(e) => updateGameSetting('soundCategory_neutral', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>プレイヤー</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(gameSettings.soundCategory_player * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateGameSetting('soundCategory_player', val / 100);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gameSettings.soundCategory_player}
              onChange={(e) => updateGameSetting('soundCategory_player', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>環境音</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(gameSettings.soundCategory_ambient * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateGameSetting('soundCategory_ambient', val / 100);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gameSettings.soundCategory_ambient}
              onChange={(e) => updateGameSetting('soundCategory_ambient', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="flex justify-between items-center text-sm font-medium text-primary">
              <span>天候</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(gameSettings.soundCategory_weather * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateGameSetting('soundCategory_weather', val / 100);
                    }
                  }}
                  className="w-20 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-secondary">%</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gameSettings.soundCategory_weather}
              onChange={(e) => updateGameSetting('soundCategory_weather', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={() => updateGameSetting('showSubtitles', !gameSettings.showSubtitles)}
          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
            gameSettings.showSubtitles
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          字幕を表示: <span className="font-bold">{gameSettings.showSubtitles ? 'ON' : 'OFF'}</span>
        </button>
      </section>

      {/* Other Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b border-gray-300 dark:border-gray-600 pb-2">
          その他の設定
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => updateGameSetting('autoJump', !gameSettings.autoJump)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.autoJump
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            自動ジャンプ: <span className="font-bold">{gameSettings.autoJump ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('toggleCrouch', gameSettings.toggleCrouch !== 0 ? 0 : 1)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.toggleCrouch !== 0
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            スニークトグル: <span className="font-bold">{gameSettings.toggleCrouch !== 0 ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('toggleSprint', gameSettings.toggleSprint !== 0 ? 0 : 1)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.toggleSprint !== 0
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            ダッシュトグル: <span className="font-bold">{gameSettings.toggleSprint !== 0 ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('pauseOnLostFocus', !gameSettings.pauseOnLostFocus)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.pauseOnLostFocus
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            フォーカス喪失で一時停止: <span className="font-bold">{gameSettings.pauseOnLostFocus ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('chunkborders', !gameSettings.chunkborders)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.chunkborders
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            チャンク境界 (F3+G): <span className="font-bold">{gameSettings.chunkborders ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('hitboxes', !gameSettings.hitboxes)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.hitboxes
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            当たり判定 (F3+B): <span className="font-bold">{gameSettings.hitboxes ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </section>

      {/* StandardSettings Specific */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b border-gray-300 dark:border-gray-600 pb-2">
          StandardSettings固有設定
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => updateGameSetting('autoF3Esc', !gameSettings.autoF3Esc)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.autoF3Esc
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            自動F3+Esc: <span className="font-bold">{gameSettings.autoF3Esc ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('toggleStandardSettings', !gameSettings.toggleStandardSettings)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.toggleStandardSettings
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            StandardSettings: <span className="font-bold">{gameSettings.toggleStandardSettings ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => updateGameSetting('toggleAll', !gameSettings.toggleAll)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
              gameSettings.toggleAll
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            すべて適用: <span className="font-bold">{gameSettings.toggleAll ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex justify-between text-sm font-medium text-primary">
            <span>最初のF3+Esc遅延（tick）</span>
            <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{gameSettings.firstAutoF3EscDelay}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={gameSettings.firstAutoF3EscDelay}
            onChange={(e) => updateGameSetting('firstAutoF3EscDelay', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </section>
    </div>
  );
}
