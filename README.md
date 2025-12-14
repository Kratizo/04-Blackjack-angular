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

## Cómo jugar PvP (Red Local / LAN)

Para jugar el modo Jugador vs Jugador (PvP), necesitas ejecutar el servidor de backend además del frontend de Angular.

### 1. Iniciar el Servidor (Backend)
El servidor maneja las conexiones de los jugadores y la lógica del juego.

```bash
cd server
npm install  # Solo la primera vez
npm start
```

El servidor escuchará en el puerto `3000`.

### 2. Iniciar el Cliente (Frontend)
Ejecuta la aplicación Angular permitiendo el acceso desde la red:

```bash
ng serve --host 0.0.0.0
```

### 3. Conectar Jugadores
1. Averigua la dirección IP de tu computadora en la red local (ej. `192.168.1.5`).
2. Abre un navegador en tu computadora y ve a `http://localhost:4200`.
3. Desde otro dispositivo (o ventana de incógnito), ve a `http://<TU_IP>:4200`.
4. Inicia sesión o regístrate en ambos dispositivos.
5. Selecciona "Jugador VS Jugador".
6. ¡El juego comenzará cuando ambos se conecten!
