const generateHtmlResponse = (appUrl, fallbackUrl) => `
  <!DOCTYPE html>
  <html>
    <body>
      <div class="loading">Opening app...</div>
      <div id="fallback" style="display: none;">
        <p>App not installed or couldn't open?</p>
        <a href="${fallbackUrl}" class="fallback-btn">Continue in Browser</a>
      </div>
      <script>
        window.location.href = "${appUrl}";
        setTimeout(() => {
          document.getElementById('fallback').style.display = 'block';
        }, 2000);
        if (navigator.platform.indexOf('Mac') !== -1) {
          setTimeout(() => { window.location.href = "${appUrl}"; }, 500);
        }
      </script>
    </body>
  </html>
`;

module.exports = { generateHtmlResponse };