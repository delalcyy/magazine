'use strict';

const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
  return _transporter;
}

async function sendVerificationEmail(email, firstName, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/eposta-dogrula?token=${token}`;

  await getTransporter().sendMail({
    from: `"FashionTV Magazine" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'E-posta adresinizi doğrulayın — FashionTV Magazine',
    html: `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:32px 48px;text-align:center;">
              <p style="margin:0;color:#c9a96e;font-size:11px;letter-spacing:4px;text-transform:uppercase;">FASHIONTV MAGAZINE</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 32px;color:#1a1a1a;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;letter-spacing:-0.5px;">Merhaba, ${firstName}</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
                FashionTV Magazine'e hoş geldiniz. Hesabınızı aktif hale getirmek için aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:3px;background:#c9a96e;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">
                      E-postamı Doğrula
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:13px;color:#888;line-height:1.6;">
                Bu link <strong>24 saat</strong> geçerlidir. Butona tıklayamıyorsanız aşağıdaki URL'yi kopyalayıp tarayıcınıza yapıştırın:
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#aaa;word-break:break-all;">${verifyUrl}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
                Bu e-postayı siz talep etmediyseniz güvenle görmezden gelebilirsiniz.<br/>
                © 2025 FashionTV Magazine. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  });
}

async function sendPasswordResetEmail(email, firstName, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/sifre-sifirla?token=${token}`;

  await getTransporter().sendMail({
    from: `"FashionTV Magazine" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Şifre Sıfırlama — FashionTV Magazine',
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">
        <tr><td style="background:#000000;padding:32px 48px;text-align:center;">
          <p style="margin:0;color:#c9a96e;font-size:11px;letter-spacing:4px;text-transform:uppercase;">FASHIONTV MAGAZINE</p>
        </td></tr>
        <tr><td style="padding:48px 48px 32px;color:#1a1a1a;">
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;letter-spacing:-0.5px;">Merhaba, ${firstName}</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
            Şifrenizi sıfırlamak için bir talep aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="border-radius:3px;background:#c9a96e;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">
                Şifremi Sıfırla
              </a>
            </td></tr>
          </table>
          <p style="margin:28px 0 0;font-size:13px;color:#888;line-height:1.6;">
            Bu link <strong>1 saat</strong> geçerlidir. Bu talebi siz yapmadıysanız güvenle görmezden gelebilirsiniz.
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:#aaa;word-break:break-all;">${resetUrl}</p>
        </td></tr>
        <tr><td style="padding:24px 48px;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
            © 2025 FashionTV Magazine. Tüm hakları saklıdır.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim()
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
