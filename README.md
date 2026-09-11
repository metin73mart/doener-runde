# Döner-Runde – Mobile Version / PWA

Diese Version ist für iPhone und Android optimiert und kann wie eine App auf dem Homescreen installiert werden.

## Neu in Version 2

- Mobile Oberfläche
- Installierbare Web-App (PWA)
- QR-Code auf der Admin-Seite
- Link kopieren / Teilen-Funktion
- WhatsApp-Sammeltext
- Funktioniert im selben WLAN oder nach Online-Deployment weltweit
- Offline-App-Oberfläche wird zwischengespeichert (Bestellungen selbst benötigen Verbindung zum Server)

## Lokal starten

1. Node.js installieren
2. ZIP entpacken
3. Terminal im Projektordner öffnen
4. `npm install`
5. `npm start`
6. Auf dem PC: `http://localhost:3000`
7. Admin: `http://localhost:3000/admin.html`

## Auf Handys im gleichen WLAN

Der Server lauscht auf allen Netzwerkadressen. Öffne auf dem Handy die lokale IP des PCs, z. B.:

`http://192.168.178.25:3000`

Wichtig: Die Firewall des PCs muss Port 3000 zulassen.

Auf der Admin-Seite erscheint automatisch ein QR-Code für die aktuell verwendete Adresse. Öffnest du die Admin-Seite bereits über die LAN-IP, zeigt der QR-Code genau diesen LAN-Link.

## Als echte Handy-App installieren

Bei einem HTTPS-Deployment kann die Seite als PWA installiert werden:

- Android/Chrome: Button „App installieren“ bzw. Browser-Menü
- iPhone/Safari: Teilen → „Zum Home-Bildschirm“

## Online stellen

Für Kollegen außerhalb des WLANs brauchst du Hosting. Geeignet sind z. B. Render, Railway, Fly.io oder ein eigener Server.

Für einen dauerhaften produktiven Einsatz sollte die Speicherung später von `orders.json` auf eine Datenbank umgestellt werden.
