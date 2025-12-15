# BlackJackAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.9.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

## Cómo jugar PvP (Red Local / LAN)

Para jugar el modo Jugador vs Jugador (PvP) en tu casa u oficina (misma red WiFi), necesitas ejecutar el servidor de backend además del frontend de Angular.

### 1. Iniciar el Servidor (Backend)
El servidor maneja las conexiones de los jugadores y la lógica del juego.

```bash
cd server
npm install  # Solo la primera vez
npm start
```

El servidor escuchará en el puerto `3000`.

### 2. Iniciar el Cliente (Frontend)
Ejecuta la aplicación Angular en un puerto diferente al del servidor (el servidor usa el 3000):

```bash
ng serve --host 0.0.0.0 --port 4200
```
**Nota:** ¡No uses el puerto 3000 para Angular (`--port 3000`) porque causará conflicto con el servidor de juego!

### 3. Configurar Firewall (Windows)
Si juegas en red local, necesitas permitir el tráfico en ambos puertos (3000 y 4200). Ejecuta esto en PowerShell como Administrador:

```powershell
# Permitir Servidor de Juego (Socket)
New-NetFirewallRule -DisplayName "Blackjack Server 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Permitir Cliente Web (Angular)
New-NetFirewallRule -DisplayName "Blackjack Web 4200" -Direction Inbound -LocalPort 4200 -Protocol TCP -Action Allow
```

### 4. Conectar Jugadores
1. Averigua la dirección IP de tu computadora en la red local (ej. `192.168.1.5`).
2. Abre un navegador en tu computadora y ve a `http://localhost:4200`.
3. Desde otro dispositivo (o ventana de incógnito), ve a `http://<TU_IP>:4200`.
4. Inicia sesión o regístrate en ambos dispositivos.
5. Selecciona **"Jugador VS Jugador"**.
6. ¡El juego comenzará cuando ambos se conecten!

---

## Cómo jugar Online (Desde otra red / Internet)

Para jugar con amigos que **no** están en tu misma red WiFi (desde sus propias casas), necesitas usar el modo **"Online"** y exponer tu servidor a internet.

La forma más fácil y segura es usar **Ngrok**.

### 1. Descargar e instalar Ngrok
1. Ve a [ngrok.com](https://ngrok.com) y crea una cuenta gratuita.
2. Descarga e instala la herramienta.
3. Conecta tu cuenta ejecutando el comando que te dan (ej. `ngrok config add-authtoken ...`).

### 2. Exponer tu servidor local
Abre una terminal y ejecuta:

```bash
ngrok http 3000
```

Ngrok generará una URL pública que se ve algo así: `https://abcd-1234.ngrok-free.app`. **Copia esa URL.**

> **Nota:** Mantén tu servidor local (`npm run server`) y Ngrok corriendo.

### 3. Conectar a los jugadores
1. **Tú (Host):** Puedes jugar desde `http://localhost:4200` y entrar al modo **"Online"**.
   - En el campo "URL del Servidor", pega la URL de Ngrok (`https://abcd-1234.ngrok-free.app`).
   - Haz clic en "Conectar".

2. **Tu Amigo (Cliente):**
   - Necesita acceder a la aplicación Angular. Si también tienes ngrok para el frontend (`ngrok http 4200`), dales esa URL para que carguen la página.
   - O, si ya tienen la app corriendo localmente, solo necesitan entrar a **"Online"**.
   - **Importante:** Ellos también deben pegar **la misma URL de Ngrok del servidor** (`https://abcd-1234.ngrok-free.app`) en el campo "URL del Servidor".
   - Haz clic en "Conectar".

¡Listo! Ngrok redirigirá el tráfico de internet a tu servidor local en el puerto 3000.
