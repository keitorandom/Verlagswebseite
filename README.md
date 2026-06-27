# Hönscheidt Publishing Website

Statische, responsive Website für den unabhängigen Verlag **Hönscheidt Publishing**. Die Seite ist für GitHub Pages vorbereitet und benötigt kein Backend, keine Datenbank, kein Framework und keine Build-Tools.

## Projektstruktur

```text
/
  index.html              # Startseite
  impressum.html          # Impressum-Vorlage
  datenschutz.html        # Datenschutz-Vorlage
  404.html                # Fehlerseite für GitHub Pages
  robots.txt              # Hinweise für Suchmaschinen
  sitemap.xml             # Sitemap mit den wichtigsten Seiten
  .nojekyll               # Liefert Dateien in GitHub Pages unverändert aus
  assets/
    css/style.css         # Gestaltung und responsive Layouts
    js/main.js            # Mobile Navigation
    images/README.md      # Hinweise für spätere Bilder
```

## Inhalte ändern

- Texte auf der Startseite bearbeiten Sie direkt in `index.html`.
- Buchdaten finden Sie im Abschnitt `Aktuelle Veröffentlichungen` in `index.html`.
- Links zu Buchdetails können vorerst auf den Kontaktbereich zeigen oder später durch eigene Detailseiten ersetzt werden.
- E-Mail-Adressen und rechtliche Angaben müssen in `index.html`, `impressum.html` und `datenschutz.html` angepasst werden.

## Buchcover und Bilder ändern

1. Laden Sie echte Coverbilder in `assets/images/` hoch.
2. Ersetzen Sie in `index.html` die aktuellen Cover-Platzhalter durch `<img>`-Elemente.
3. Verwenden Sie kurze, aussagekräftige `alt`-Texte, zum Beispiel: `alt="Cover des Romans Die leisen Karten"`.
4. Hinterlegen Sie später ein Social-Sharing-Bild unter `assets/images/social-sharing-placeholder.jpg` oder passen Sie die Open-Graph-Metadaten in den HTML-Dateien an.

## GitHub Pages

GitHub Pages ist bereits über den Branch `main` und das Root-Verzeichnis `/(root)` aktiviert. Die Website benötigt keinen Build-Schritt: GitHub veröffentlicht die statischen Dateien direkt aus dem Repository-Root.

## Eigene Domain bei STRATO verbinden

Die Domain `hoenscheidt-publishing.de` kann später bei STRATO per DNS mit GitHub Pages verbunden werden. Folgen Sie dazu der aktuellen GitHub-Pages-Dokumentation für Apex-Domains und `www`-Subdomains und tragen Sie die erforderlichen DNS-Records im STRATO-Kundenbereich ein.

## Rechtlicher Hinweis

`impressum.html` und `datenschutz.html` enthalten bewusst markierte Platzhalter. Beide Seiten müssen vor Veröffentlichung vollständig ergänzt und rechtlich geprüft werden. Dies gilt insbesondere für Anbieterkennzeichnung, Verantwortliche, Kontaktangaben, Hosting-Angaben, Google-Fonts-Einbindung und mögliche spätere Funktionen wie Kontaktformular, Newsletter oder Tracking.

## Nächste Schritte

1. Inhalte und Buchdaten ersetzen
2. Echte Coverbilder in `assets/images` hochladen
3. Impressum und Datenschutz rechtlich ergänzen
4. STRATO-DNS mit GitHub Pages verbinden
5. HTTPS in GitHub Pages prüfen oder aktivieren
