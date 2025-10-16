# Autocontrol & Mentoring AI

Una aplicación web de autoobservación y mentoring con IA que te ayuda a registrar actividades, pensamientos y progreso de metas, con retroalimentación de un mentor de IA personalizado.

## Características

- **Registro Rápido**: Botones de acceso rápido para registrar actividades con emojis
- **Timeline del Día**: Vista cronológica de todas tus actividades
- **Métricas**: Análisis de uso del tiempo con porcentajes por categoría
- **Metas y Tareas**: Sistema completo de gestión de objetivos
- **Coach IA**: Chat con un mentor personalizado (mentor, terapeuta o maestro)
- **Historial**: Revisa tus actividades y pensamientos pasados
- **Undo**: Deshace acciones en 30 segundos

## Stack Tecnológico

- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **IA**: Vercel AI SDK con OpenAI GPT-4o-mini
- **UI**: shadcn/ui components

## Heurísticas de Nielsen Implementadas

1. **Visibilidad del estado del sistema**: Indicadores de "Activo", toasts de confirmación
2. **Correspondencia con el mundo real**: Lenguaje en español, emojis intuitivos
3. **Control y libertad del usuario**: Función de deshacer (30 segundos)
4. **Consistencia y estándares**: Diseño uniforme en todas las páginas
5. **Prevención de errores**: Validaciones de formularios, confirmaciones
6. **Reconocimiento antes que recuerdo**: Botones visibles, autocompletado
7. **Flexibilidad y eficiencia**: Atajos de teclado (L, N, U, F)
8. **Diseño minimalista**: Interfaz limpia y enfocada
9. **Ayuda con errores**: Mensajes claros y específicos
10. **Ayuda y documentación**: Tooltips y guías contextuales

## Configuración

### Variables de Entorno

Las siguientes variables se configuran automáticamente al conectar las integraciones:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Instalación

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Conecta Supabase desde la interfaz de v0
4. Ejecuta los scripts SQL en orden desde la carpeta `scripts/`
5. Inicia el servidor: `npm run dev`

## Estructura de la Base de Datos

- `users_profile`: Perfil del usuario y rol del LLM
- `categories`: Categorías de actividades con emojis
- `activities`: Registro de actividades con inicio/fin
- `thoughts`: Pensamientos y reflexiones
- `goals`: Metas del usuario
- `tasks`: Tareas asociadas a metas
- `coach_messages`: Historial de chat con el coach
- `insights`: Resúmenes diarios generados por IA

## Uso

1. **Registro**: Crea una cuenta y completa el onboarding
2. **Registra actividades**: Usa los botones de Quick Log
3. **Revisa métricas**: Ve tu progreso en la página de Métricas
4. **Habla con tu coach**: Pide consejos en la página Coach
5. **Gestiona metas**: Crea y sigue tus objetivos en Metas
6. **Revisa historial**: Exporta tus datos desde Historial

## Atajos de Teclado

- `L`: Abrir registro de actividad
- `N`: Nuevo pensamiento
- `U`: Deshacer última acción
- `F`: Buscar

## Licencia

MIT
