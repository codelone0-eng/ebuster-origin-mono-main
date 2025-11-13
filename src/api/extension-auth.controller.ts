import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getSupabaseAdmin } from '../api/supabase-admin';

// JWT секрет (должен совпадать с auth.controller.ts)
const JWT_SECRET = process.env.JWT_SECRET || 'ebuster_2024_super_secure_jwt_key_7f8a9b2c4d6e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b';

// Страница авторизации для расширения
export const extensionLoginPage = (req: Request, res: Response) => {
    const { client_id, response_type, redirect_uri } = req.query;

    if (!client_id || !response_type || !redirect_uri) {
        return res.status(400).send('Missing required OAuth parameters.');
    }

    // Generate nonce for CSP
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Render a login page that matches the main website's design
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ebuster Extension Authorization</title>
            <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --background: #1a1a1a;
                    --foreground: #d9d9d9;
                    --card: #202020;
                    --card-foreground: #d9d9d9;
                    --primary: #a0a0a0;
                    --primary-foreground: #1a1a1a;
                    --secondary: #303030;
                    --secondary-foreground: #d9d9d9;
                    --muted: #2a2a2a;
                    --muted-foreground: #808080;
                    --accent: #404040;
                    --accent-foreground: #d9d9d9;
                    --border: #303030;
                    --content-border: #606060;
                    --input: #303030;
                    --ring: #a0a0a0;
                    --font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    --radius: 0.35rem;
                    --shadow-sm: 0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 1px 2px -1px hsl(0 0% 20% / 0.15);
                    --shadow-md: 0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 2px 4px -1px hsl(0 0% 20% / 0.15);
                    --shadow-lg: 0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 4px 6px -1px hsl(0 0% 20% / 0.15);
                }

                .dark {
                    --background: #1a1a1a;
                    --foreground: #d9d9d9;
                    --card: #202020;
                    --card-foreground: #d9d9d9;
                    --primary: #a0a0a0;
                    --primary-foreground: #1a1a1a;
                    --secondary: #303030;
                    --secondary-foreground: #d9d9d9;
                    --muted: #2a2a2a;
                    --muted-foreground: #808080;
                    --accent: #404040;
                    --accent-foreground: #d9d9d9;
                    --border: #1a1a1a;
                    --content-border: #606060;
                    --input: #303030;
                    --ring: #a0a0a0;
                }

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: var(--background);
                    color: var(--foreground);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-smooth: always;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                }

                .login-container {
                    background-color: var(--card);
                    border-radius: calc(var(--radius) + 0.5rem);
                    padding: 40px;
                    box-shadow: var(--shadow-md);
                    max-width: 400px;
                    width: 100%;
                    text-align: center;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                
                .logo-icon {
                    width: 40px;
                    height: 40px;
                    background-color: var(--primary);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--primary-foreground);
                }
                
                .logo-text h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--foreground);
                }
                
                .logo-text p {
                    margin: 0;
                    font-size: 14px;
                    color: var(--muted-foreground);
                }

                h1 {
                    color: var(--foreground);
                    margin-bottom: 12px;
                    font-size: 24px;
                    font-weight: 600;
                }

                .subtitle {
                    color: var(--muted-foreground);
                    margin-bottom: 32px;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .btn {
                    width: 100%;
                    padding: 12px;
                    background-color: var(--primary);
                    color: var(--primary-foreground);
                    border: none;
                    border-radius: var(--radius);
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease, transform 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .btn:hover {
                    background-color: color-mix(in srgb, var(--primary) 90%, black);
                    transform: translateY(-1px);
                }
                
                .btn:active {
                    transform: translateY(0);
                }
                
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .error {
                    color: #e06666;
                    margin-top: 16px;
                    font-size: 14px;
                    padding: 12px;
                    background: rgba(224, 102, 102, 0.1);
                    border: 1px solid rgba(224, 102, 102, 0.2);
                    border-radius: var(--radius);
                    display: none;
                }

                .loading {
                    display: none;
                    margin-top: 16px;
                }

                .loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--muted);
                    border-top: 2px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .extension-info {
                    margin-top: 24px;
                    padding: 16px;
                    background: var(--muted);
                    border-radius: var(--radius);
                    font-size: 12px;
                    color: var(--muted-foreground);
                }

                /* Dark mode detection */
                @media (prefers-color-scheme: dark) {
                    :root {
                        --background: #1a1a1a;
                        --foreground: #d9d9d9;
                        --card: #202020;
                        --card-foreground: #d9d9d9;
                        --primary: #a0a0a0;
                        --primary-foreground: #1a1a1a;
                        --secondary: #303030;
                        --secondary-foreground: #d9d9d9;
                        --muted: #2a2a2a;
                        --muted-foreground: #808080;
                        --accent: #404040;
                        --accent-foreground: #d9d9d9;
                        --border: #1a1a1a;
                        --content-border: #606060;
                        --input: #303030;
                        --ring: #a0a0a0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <div class="logo">
                    <div class="logo-icon">E</div>
                    <div class="logo-text">
                        <h1>Ebuster</h1>
                        <p>Extension Authentication</p>
                    </div>
                </div>
                <h1>Login to Ebuster</h1>
                <p>Authorize the Chrome extension to access your account.</p>
                <button id="oauthLoginButton" class="btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                    Login with Ebuster
                </button>
                <div id="loading" class="loading">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 8px; color: var(--muted-foreground);">Redirecting to authorization...</p>
                </div>
                <div id="errorMessage" class="error-message" style="display:none;"></div>
                <div class="extension-info">
                    <strong>Extension:</strong> Ebuster Chrome Extension<br>
                    <strong>Permissions:</strong> Read your profile, sync scripts
                </div>
            </div>

            <script nonce="${nonce}">
                const oauthButton = document.getElementById('oauthLoginButton');
                const loading = document.getElementById('loading');
                const errorMessage = document.getElementById('errorMessage');

                oauthButton.addEventListener('click', async () => {
                    try {
                        oauthButton.disabled = true;
                        oauthButton.style.display = 'none';
                        loading.style.display = 'block';
                        errorMessage.style.display = 'none';

                        // Redirect to main website's login page for OAuth flow
                        const baseUrl = '${process.env.FRONTEND_URL || 'https://ebuster.ru'}';
                        const oauthUrl = \`\${baseUrl}/login?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=profile scripts\`;
                        window.location.href = oauthUrl;
                    } catch (error) {
                        console.error('OAuth initiation failed:', error);
                        showError('Failed to initiate authorization. Please try again.');
                    }
                });

                function showError(message) {
                    errorMessage.textContent = message;
                    errorMessage.style.display = 'block';
                    oauthButton.disabled = false;
                    oauthButton.style.display = 'block';
                    loading.style.display = 'none';
                }

                // Handle callback from OAuth flow
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const error = urlParams.get('error');
                const errorDescription = urlParams.get('error_description');

                if (error) {
                    showError(\`Authorization failed: \${errorDescription || error}\`);
                } else if (code) {
                    // Exchange code for token
                    (async () => {
                        try {
                            const response = await fetch('/auth/extension-login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    code: code,
                                    client_id: '${client_id}',
                                    redirect_uri: '${redirect_uri}'
                                })
                            });

                            if (response.ok) {
                                const data = await response.json();
                                if (data.token) {
                                    // Redirect back to extension with token
                                    window.location.href = \`${redirect_uri}?token=\${data.token}\`;
                                } else {
                                    showError('No token received from server.');
                                }
                            } else {
                                const errorData = await response.json();
                                showError(errorData.error || 'Authorization failed.');
                            }
                        } catch (error) {
                            console.error('Token exchange failed:', error);
                            showError('Failed to complete authorization. Please try again.');
                        }
                    })();
                }
            </script>
        </body>
        </html>
    `);
};

// Временное хранилище для authorization codes (в production использовать Redis)
const authCodes = new Map<string, { userId: string; email: string; expiresAt: number }>();

// Сохранение authorization code (вызывается из ExtensionAuth.tsx)
export const saveAuthCode = async (req: Request, res: Response) => {
    try {
        const { code, userId, email } = req.body;
        
        if (!code || !userId || !email) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Сохраняем код на 5 минут
        authCodes.set(code, {
            userId,
            email,
            expiresAt: Date.now() + 5 * 60 * 1000
        });
        
        console.log(`🔐 [saveAuthCode] Saved code ${code} for user ${email}`);
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Save auth code error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Обмен authorization code на токен и данные пользователя
export const exchangeCode = async (req: Request, res: Response) => {
    try {
        const { code, client_id } = req.body;
        
        console.log(`🔐 [exchangeCode] Received request:`, { code, client_id });
        
        if (!code || !client_id) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Проверяем client_id
        if (client_id !== 'ebuster-extension') {
            return res.status(400).json({ error: 'Invalid client_id' });
        }
        
        // Получаем данные по коду
        const codeData = authCodes.get(code);
        
        if (!codeData) {
            console.log(`🔐 [exchangeCode] Code not found: ${code}`);
            return res.status(400).json({ error: 'Invalid or expired authorization code' });
        }
        
        // Проверяем истечение
        if (Date.now() > codeData.expiresAt) {
            authCodes.delete(code);
            console.log(`🔐 [exchangeCode] Code expired: ${code}`);
            return res.status(400).json({ error: 'Authorization code expired' });
        }
        
        // Удаляем использованный код
        authCodes.delete(code);
        
        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        
        // Получаем полные данные пользователя из БД
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url, role, created_at')
            .eq('id', codeData.userId)
            .single();
            
        if (userError || !user) {
            console.error(`🔐 [exchangeCode] User not found:`, userError);
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Создаем JWT токен для расширения
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role || 'user'
            },
            JWT_SECRET,
            { expiresIn: '30d' } // 30 дней для расширения
        );
        
        console.log(`🔐 [exchangeCode] Success for user: ${user.email}`);
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                role: user.role || 'user',
                created_at: user.created_at
            }
        });
        
    } catch (error) {
        console.error('🔐 [exchangeCode] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Старый метод (deprecated, оставлен для совместимости)
export const extensionLogin = exchangeCode;