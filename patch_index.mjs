import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const protectionScript = `
    <script>
      // Defensive script to prevent Uncaught TypeError when third-party scripts/extensions try to overwrite fetch
      try {
        const originalFetch = window.fetch;
        Object.defineProperty(window, 'fetch', {
          get: function() { return originalFetch; },
          set: function(val) {
            console.warn("Blocked attempt to overwrite window.fetch");
          },
          configurable: true
        });
      } catch (e) {
        console.error("Could not protect window.fetch:", e);
      }
    </script>
`;

html = html.replace('<head>', '<head>' + protectionScript);
fs.writeFileSync('index.html', html);
