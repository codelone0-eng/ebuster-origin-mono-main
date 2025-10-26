import { useState } from 'react';

export const ExtensionDemoExact = () => {
  const [activeTab, setActiveTab] = useState('scripts');

  return (
    <div className="w-full max-w-[800px] h-[600px] mx-auto bg-[#1a1a1a] rounded-[0.35rem] shadow-2xl overflow-hidden font-sans">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-[240px] bg-[#1a1a1a] border-r border-[#303030] flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-[#303030]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[calc(0.35rem*2)] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7">
                  <defs>
                    <linearGradient id="lightning-gradient-demo" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#606060', stopOpacity: 1 }}>
                        <animate attributeName="stop-color" values="#606060;#a0a0a0;#d0d0d0;#a0a0a0;#606060" dur="3s" repeatCount="indefinite"/>
                      </stop>
                      <stop offset="50%" style={{ stopColor: '#a0a0a0', stopOpacity: 1 }}>
                        <animate attributeName="stop-color" values="#a0a0a0;#d0d0d0;#a0a0a0;#606060;#a0a0a0" dur="3s" repeatCount="indefinite"/>
                      </stop>
                      <stop offset="100%" style={{ stopColor: '#606060', stopOpacity: 1 }}>
                        <animate attributeName="stop-color" values="#606060;#a0a0a0;#606060;#808080;#606060" dur="3s" repeatCount="indefinite"/>
                      </stop>
                    </linearGradient>
                  </defs>
                  <path 
                    d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                    fill="url(#lightning-gradient-demo)"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(160, 160, 160, 0.6))',
                      animation: 'lightning-pulse 2s ease-in-out infinite'
                    }}
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-[20px] font-semibold text-[#d9d9d9]">Ebuster</h1>
                <span className="text-[11px] text-[#808080]">v1.0.0</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            <button
              onClick={() => setActiveTab('scripts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[0.35rem] transition-all text-sm ${
                activeTab === 'scripts'
                  ? 'bg-[#a0a0a0] text-[#1a1a1a]'
                  : 'text-[#808080] hover:text-[#d9d9d9] hover:bg-[#2a2a2a]'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span className="font-medium">Скрипты</span>
            </button>

            <button
              onClick={() => setActiveTab('store')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[0.35rem] transition-all text-sm ${
                activeTab === 'store'
                  ? 'bg-[#a0a0a0] text-[#1a1a1a]'
                  : 'text-[#808080] hover:text-[#d9d9d9] hover:bg-[#2a2a2a]'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span className="font-medium">Магазин</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[0.35rem] transition-all text-sm ${
                activeTab === 'create'
                  ? 'bg-[#a0a0a0] text-[#1a1a1a]'
                  : 'text-[#808080] hover:text-[#d9d9d9] hover:bg-[#2a2a2a]'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span className="font-medium">Создать</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[0.35rem] transition-all text-sm ${
                activeTab === 'settings'
                  ? 'bg-[#a0a0a0] text-[#1a1a1a]'
                  : 'text-[#808080] hover:text-[#d9d9d9] hover:bg-[#2a2a2a]'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span className="font-medium">Настройки</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-[#303030] space-y-3">
            {/* Theme Toggle */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[#808080] block">Тема</label>
              <div className="flex gap-2">
                <button className="flex-1 p-2 rounded-[0.35rem] bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[#d9d9d9]">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                </button>
                <button className="flex-1 p-2 rounded-[0.35rem] hover:bg-[#2a2a2a] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[#808080]">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[#808080] block">Язык</label>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 rounded-[0.35rem] bg-[#a0a0a0] text-[#1a1a1a] text-xs font-medium">
                  RU
                </button>
                <button className="flex-1 px-3 py-1.5 rounded-[0.35rem] bg-[#2a2a2a] text-[#808080] text-xs font-medium hover:bg-[#3a3a3a]">
                  EN
                </button>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 rounded-[0.35rem] bg-[#2a2a2a] relative">
              <div className="w-9 h-9 rounded-full bg-[#a0a0a0] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1a1a1a]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#d9d9d9] truncate">root</div>
                <div className="text-xs text-[#22c55e] flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
                  </span>
                  В сети
                </div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center bg-transparent border border-[#303030] rounded-[0.35rem] text-[#808080] hover:bg-[#3a3a3a] hover:text-[#d9d9d9] hover:border-[#d9d9d9] transition-all flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#1a1a1a] overflow-hidden flex flex-col">
          {activeTab === 'scripts' && (
            <>
              <div className="p-6 border-b border-[#303030]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-[#d9d9d9]">Мои скрипты</h1>
                    <p className="text-sm text-[#808080]">Управление установленными скриптами</p>
                  </div>
                  <button className="px-4 py-2 bg-[#a0a0a0] text-[#1a1a1a] rounded-[0.35rem] text-sm font-medium hover:bg-[#b0b0b0] transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Добавить
                  </button>
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#808080]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Поиск скриптов..."
                    className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#303030] rounded-[0.35rem] text-sm text-[#d9d9d9] placeholder-[#808080] focus:outline-none focus:border-[#606060]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 mb-4 text-[#606060]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#d9d9d9] mb-2">Нет установленных скриптов</h3>
                  <p className="text-sm text-[#808080] mb-4">Начните с добавления вашего первого скрипта</p>
                  <button className="px-4 py-2 bg-[#a0a0a0] text-[#1a1a1a] rounded-[0.35rem] text-sm font-medium hover:bg-[#b0b0b0] transition-colors">
                    Добавить скрипт
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'store' && (
            <>
              <div className="p-6 border-b border-[#303030]">
                <h1 className="text-2xl font-bold text-[#d9d9d9]">Магазин скриптов</h1>
                <p className="text-sm text-[#808080]">Готовые решения от сообщества</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-6 text-[#606060]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#d9d9d9] mb-2">Скоро: готовые решения</h3>
                  <p className="text-sm text-[#808080] mb-6">Мы работаем над созданием магазина скриптов</p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-[0.35rem] border border-[#303030]">
                      <div className="w-8 h-8 bg-[#a0a0a0]/10 rounded-[0.35rem] flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#a0a0a0]">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <span className="text-sm text-[#d9d9d9]">Проверенные скрипты</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-[0.35rem] border border-[#303030]">
                      <div className="w-8 h-8 bg-[#a0a0a0]/10 rounded-[0.35rem] flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#a0a0a0]">
                          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                        </svg>
                      </div>
                      <span className="text-sm text-[#d9d9d9]">Автообновления</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#a0a0a0] text-[#1a1a1a] rounded-[0.35rem] text-sm font-medium hover:bg-[#b0b0b0] transition-colors">
                    Создать свой скрипт
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'create' && (
            <>
              <div className="p-6 border-b border-[#303030]">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[#d9d9d9]">Создать скрипт</h1>
                    <p className="text-sm text-[#808080]">Напишите и протестируйте свой скрипт</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#2a2a2a] border border-[#303030] text-[#d9d9d9] rounded-[0.35rem] text-sm font-medium hover:bg-[#3a3a3a] transition-colors flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Сохранить
                    </button>
                    <button className="px-4 py-2 bg-[#a0a0a0] text-[#1a1a1a] rounded-[0.35rem] text-sm font-medium hover:bg-[#b0b0b0] transition-colors flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                      Установить
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="h-full bg-[#2a2a2a] border border-[#303030] rounded-[0.35rem] p-4 font-mono text-xs text-[#808080]">
                  <div className="text-[#a0a0a0]">// ==UserScript==</div>
                  <div className="text-[#a0a0a0]">// @name         New Script</div>
                  <div className="text-[#a0a0a0]">// @version      1.0.0</div>
                  <div className="text-[#a0a0a0]">// @description  My custom script</div>
                  <div className="text-[#a0a0a0]">// @author       You</div>
                  <div className="text-[#a0a0a0]">// @match        *://*/*</div>
                  <div className="text-[#a0a0a0]">// ==/UserScript==</div>
                  <br/>
                  <div className="text-[#d9d9d9]">(function() {'{'}</div>
                  <div className="pl-4 text-[#808080]">// Your code here</div>
                  <div className="pl-4">console.<span className="text-[#d9d9d9]">log</span>(<span className="text-[#22c55e]">'Script loaded!'</span>);</div>
                  <div className="text-[#d9d9d9]">{'}'})();</div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <div className="p-6 border-b border-[#303030]">
                <h1 className="text-2xl font-bold text-[#d9d9d9]">Настройки</h1>
                <p className="text-sm text-[#808080]">Настройте Ebuster под себя</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-[#2a2a2a] border border-[#303030] rounded-[0.35rem] p-4 space-y-4">
                  <h3 className="font-semibold text-[#d9d9d9]">Общие настройки</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#d9d9d9] text-sm">Автообновление скриптов</div>
                      <div className="text-xs text-[#808080]">Проверять обновления автоматически</div>
                    </div>
                    <div className="relative w-11 h-6 rounded-full bg-[#a0a0a0] cursor-pointer">
                      <div className="absolute top-0.5 translate-x-5 w-5 h-5 bg-white rounded-full shadow-md" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#d9d9d9] text-sm">Показывать уведомления</div>
                      <div className="text-xs text-[#808080]">Уведомления об обновлениях</div>
                    </div>
                    <div className="relative w-11 h-6 rounded-full bg-[#a0a0a0] cursor-pointer">
                      <div className="absolute top-0.5 translate-x-5 w-5 h-5 bg-white rounded-full shadow-md" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes lightning-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(160, 160, 160, 0.6)) brightness(1);
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(200, 200, 200, 0.9)) brightness(1.3);
            transform: scale(1.05);
          }
        }
      `}} />
    </div>
  );
};
