/**
 * return html template as text to send on email message
 * @param {string} name -name of sender
 * @param {string} subject  -seubject of email
 * @param {string} from  -message sender
 * @param {string} message -main message
 * @returns 
 */

const mailHTML = (name, subject, from, message) => {
  return `
  <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>New Contact Message</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f6f8fa;
        padding: 20px;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      .header {
        border-bottom: 1px solid #eee;
        margin-bottom: 20px;
      }
      .header h2 {
        margin: 0;
        color: #444;
      }
      .info {
        margin-bottom: 20px;
      }
      .info p {
        margin: 5px 0;
      }
      .message {
        white-space: pre-line;
        padding: 15px;
        background-color: #f0f4f8;
        border-left: 4px solid #007acc;
        border-radius: 4px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>📩 New Contact Message</h2>
      </div>
      <div class="info">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${from}</p>
        <p><strong>Subject:</strong> ${subject}</p>
      </div>
      <div class="message">
        ${message}
      </div>
      <div class="footer">
        This message was sent via your website contact form.
      </div>
    </div>
  </body>
</html>
  `
}

const blogMailTemplet = (authorName, blogTitle, blogUrl) => {
  return `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2c3e50;">📝 New Blog Published</h2>
        <p>Hi there,</p>
        <p><strong>${authorName}</strong> just published a new blog titled:</p>
        <h3 style="color: #27ae60;">${blogTitle}</h3>
        <p>
            Click the button below to read it:
        </p>
        <a href="${blogUrl}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Read Now</a>
        <p style="margin-top: 30px;">Thank you for subscribing 🙌</p>
    </div>
    `;
}
const RoleAssignmentMailTemplate = (name, blogTitle, blogUrl) => {
  return `
  <!DOCTYPE html>
<html>
  <head>
    <style>
      .button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 18px;
        border: none;
        border-radius: 5px;
        text-decoration: none;
        display: inline-block;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <h2>Hello ${name},</h2>
    <p>
      You have been assigned as an <strong>editor</strong> for the blog titled:
      <strong>"${blogTitle}"</strong>.
    </p>
    <p>
      You can start editing by visiting the blog below:
    </p>
    <p>
      <a class="button" href="${blogUrl}">Edit Blog</a>
    </p>
    <p>Thanks,<br/>The Team</p>
  </body>
</html>

  `
}

const roleRevokedEmailTemplate = (name, blogTitle) => {
  return ` 
   <!DOCTYPE html>
<html>
  <head>
    <style>
      .notice {
        padding: 10px;
        background-color: #f44336;
        color: white;
        border-radius: 5px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <h2>Hello ${name},</h2>
    <p class="notice">
      Your editor access to the blog titled <strong>"${blogTitle}"</strong> has been revoked.
    </p>
    <p>If you believe this was a mistake, please contact the author.</p>
    <p>Regards,<br/>The Team</p>
  </body>
</html>

  `
}

module.exports = { mailHTML, blogMailTemplet,RoleAssignmentMailTemplate,roleRevokedEmailTemplate }