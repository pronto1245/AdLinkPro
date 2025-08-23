export interface PasswordResetEmailData {
  email: string;
  resetLink: string;
  expirationHours: number;
}

export function generatePasswordResetEmailText(data: PasswordResetEmailData): string {
  return `
Восстановление пароля AdLinkPro

Здравствуйте!

Мы получили запрос на восстановление пароля для вашего аккаунта ${data.email}.

Для сброса пароля перейдите по ссылке:
${data.resetLink}

Важно:
• Ссылка действительна в течение ${data.expirationHours} часов
• Если вы не запрашивали восстановление пароля, проигнорируйте это письмо
• По соображениям безопасности не пересылайте это письмо

Если у вас возникли вопросы, обратитесь в службу поддержки.

С уважением,
Команда AdLinkPro
  `.trim();
}

export function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Восстановление пароля - AdLinkPro</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            font-size: 20px;
            color: #1e40af;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background 0.3s;
        }
        .reset-button:hover {
            background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
        }
        .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 30px;
        }
        .link {
            color: #3b82f6;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">AdLinkPro</div>
            <div class="title">Восстановление пароля</div>
        </div>
        
        <div class="content">
            <p>Здравствуйте!</p>
            
            <p>Мы получили запрос на восстановление пароля для вашего аккаунта <strong>${data.email}</strong>.</p>
            
            <p>Для сброса пароля нажмите кнопку ниже:</p>
            
            <div style="text-align: center;">
                <a href="${data.resetLink}" class="reset-button">Восстановить пароль</a>
            </div>
            
            <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
            <p class="link">${data.resetLink}</p>
            
            <div class="warning">
                <div class="warning-title">Важно:</div>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    <li>Ссылка действительна в течение <strong>${data.expirationHours} часов</strong></li>
                    <li>Если вы не запрашивали восстановление пароля, проигнорируйте это письмо</li>
                    <li>По соображениям безопасности не пересылайте это письмо</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Если у вас возникли вопросы, обратитесь в службу поддержки.</p>
            <p><strong>С уважением, команда AdLinkPro</strong></p>
        </div>
    </div>
</body>
</html>
  `.trim();
}
