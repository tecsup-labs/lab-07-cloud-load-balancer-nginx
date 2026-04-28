# 🚀 Taskionix - Fullstack To-Do App

Taskionix es una aplicación de gestión de tareas diseñada con una estética moderna (Awwwards style) y preparada para entornos de alta disponibilidad con balanceo de carga.

## 🧱 Stack Tecnológico
- **Backend:** Node.js + Express
- **Frontend:** HTML5, CSS3 (Glassmorphism), Bootstrap 5, Vanilla JS
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT (JSON Web Tokens)
- **Seguridad:** Bcrypt para hashing de contraseñas

## 🛠️ Instalación y Configuración

### 1. Clonar el proyecto e instalar dependencias
```bash
npm install
```

### 2. Configurar la Base de Datos (PostgreSQL)
1. Crea una base de datos en PostgreSQL llamada `taskionix`.
2. Ejecuta el script `init.sql` para crear las tablas necesarias:
```bash
psql -U tu_usuario -d taskionix -f init.sql
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=taskionix
DB_PORT=5432
JWT_SECRET=tu_secreto_super_seguro
```

## 🚀 Ejecución

### Ejecutar una sola instancia
```bash
npm start
```

### Ejecutar múltiples instancias (Load Balancing Ready)
Puedes levantar varias instancias en diferentes puertos para probar el balanceo de carga (por ejemplo, con Nginx):

```bash
PORT=8081 node app.js
PORT=8082 node app.js
PORT=8083 node app.js
```

## 🌐 Arquitectura y Balanceo de Carga
- **Sin Estado (Stateless):** La aplicación no utiliza sesiones en memoria. Toda la autenticación se maneja vía JWT y los datos residen en PostgreSQL.
- **Port Visibility:** El dashboard muestra el puerto en el que está corriendo el servidor actual, permitiendo verificar visualmente el balanceo cuando se usa un proxy inverso.
- **Producción:** Listo para ser desplegado detrás de un balanceador de carga como Nginx o AWS ALB.

## 📋 Funcionalidades
- ✅ Registro e Inicio de sesión seguro.
- ✅ CRUD completo de tareas.
- ✅ Marcado de tareas completadas.
- ✅ Diseño Responsive y Premium.
- ✅ Logout con eliminación de token.

## 🎨 Diseño
- **Glassmorphism:** Uso de transparencias y blur.
- **Gradients:** Paleta de colores moderna (indigo, cyan, pink).
- **Animations:** Transiciones suaves y efectos hover.

---
Desarrollado por Antigravity para el curso de Soluciones en la Nube.
# lab-07-cloud-load-balancer-nginx
