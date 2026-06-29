# Lokale Schriftarten (optional)

Aktuell verwendet die Website ausschließlich datenschutzfreundliche Systemschriften:

- Überschriften: `Georgia`, `"Times New Roman"`, `serif`
- Fließtext: `Arial`, `Helvetica`, `sans-serif`

Wenn später eigene Webfonts genutzt werden sollen, legen Sie ausschließlich selbst gehostete `.woff2`-Dateien in diesem Ordner ab. Danach können in `assets/css/style.css` passende `@font-face`-Regeln ergänzt und die CSS-Variablen `--serif` und `--sans` auf die lokalen Font-Familien umgestellt werden.

Bitte keine externen Google-Fonts-URLs einbinden und keine Fontdateien ohne geklärte Lizenz committen.
