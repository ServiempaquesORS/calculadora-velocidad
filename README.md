# Calculadora de costo oculto — despliegue desde cero

## 1. Antes de publicar
Edita `config.js` con tus propias llaves (los pasos para conseguir cada una están abajo) y reemplaza el WhatsApp de placeholder.

## 2. Crear el repositorio en GitHub
1. Entra a github.com y crea una cuenta (si no tienes).
2. Clic en "New repository" → nómbralo `calculadora-costos` → Create repository.
3. Sube los archivos del proyecto con "Add file → Upload files" en la web de GitHub — no necesitas terminal.

## 3. Conectar con Vercel
1. Entra a vercel.com → "Continue with GitHub".
2. "Add New → Project" → selecciona `calculadora-costos` → Import.
3. Es un sitio estático: deja la configuración por defecto → "Deploy".
4. Te da una URL pública (ej. `calculadora-costos.vercel.app`). Cada vez que subas un cambio a GitHub, Vercel lo republica solo.

## 4. Crear la base de datos en Supabase (para guardar los leads)
1. Entra a supabase.com → crea un proyecto nuevo (elige una contraseña de base de datos y guárdala).
2. Ve a "SQL Editor" → pega el contenido de `supabase-schema.sql` → Run. Esto crea la tabla `leads` y la deja protegida (el sitio solo puede escribir, no leer).
3. Ve a "Project Settings → API" → copia el "Project URL" y el "anon public key" → pégalos en `config.js` en `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
4. Para ver los leads que van llegando: en Supabase, ve a "Table Editor → leads".

## 5. Configurar el correo automático (EmailJS)
1. Entra a emailjs.com → crea una cuenta gratuita (200 correos/mes gratis, suficiente para empezar).
2. "Email Services → Add New Service" → conecta el correo desde el que quieres que lleguen las notificaciones (ej. tu Gmail).
3. "Email Templates → Create New Template" → arma un mensaje simple usando estas variables: `{{lead_nombre}}`, `{{lead_empresa}}`, `{{lead_telefono}}`, `{{lead_correo}}`, `{{dias_contratacion_directa}}`, `{{costo_oculto}}`, y pon `{{to_email}}` en el campo "To Email" de la plantilla.
4. Copia el "Public Key" (Account → General), el "Service ID" y el "Template ID" → pégalos en `config.js`.
5. En `NOTIFICATION_EMAIL` de `config.js` pon el correo donde tú quieres recibir el aviso de cada lead nuevo.

## 6. WhatsApp
En `config.js`, cambia `WHATSAPP_NUMBER` por el número real (indicativo + número, sin espacios ni +, ej. `573001234567`). Cuando alguien completa el formulario, se abre WhatsApp automáticamente con un mensaje prellenado con sus datos y su resultado.

## Qué pasa cuando alguien completa el formulario
1. El lead queda guardado en la tabla `leads` de Supabase (con los datos del cálculo).
2. Te llega un correo automático con sus datos.
3. Se le abre WhatsApp con un mensaje ya redactado para que te escriba directamente.
