#!/bin/bash
# Script de configuración de Supabase para MANEL TERMINAL

echo "========================================"
echo "   MANEL TERMINAL - Setup Supabase"
echo "========================================"
echo

# Verificar si ya hay credenciales
if [ -f .env.local ]; then
    source .env.local
    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        echo "Ya hay credenciales configuradas."
        echo "URL: $NEXT_PUBLIC_SUPABASE_URL"
        exit 0
    fi
fi

echo "PASO 1: Crear proyecto en Supabase"
echo "------------------------------------"
echo "1. Ve a: https://supabase.com/dashboard"
echo "2. Haz login o crea cuenta (gratis)"
echo "3. Click 'New Project'"
echo "4. Nombre: manel-terminal"
echo "5. Password: genera uno seguro"
echo "6. Region: más cercana (ej: Frankfurt)"
echo "7. Click 'Create new project'"
echo
read -p "Presiona ENTER cuando el proyecto esté creado..."

echo
echo "PASO 2: Ejecutar el Schema SQL"
echo "------------------------------------"
echo "1. En el dashboard, ve a 'SQL Editor'"
echo "2. Click 'New Query'"
echo "3. Copia y pega el contenido de: supabase_schema.sql"
echo "4. Click 'Run'"
echo
read -p "Presiona ENTER cuando hayas ejecutado el SQL..."

echo
echo "PASO 3: Obtener credenciales"
echo "------------------------------------"
echo "1. Ve a 'Project Settings' (icono engranaje)"
echo "2. Click 'API'"
echo "3. Copia 'Project URL' y 'anon public' key"
echo

read -p "Pega el Project URL: " SUPABASE_URL
read -p "Pega el anon key: " SUPABASE_KEY

echo
echo "Guardando configuración..."

cat > .env.local << ENVEOF
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_KEY}
ENVEOF

echo "Configuración guardada en .env.local"
echo

# Crear archivo para el script de sync
cat > .env.supabase << ENVEOF
export SUPABASE_URL=${SUPABASE_URL}
export SUPABASE_KEY=${SUPABASE_KEY}
ENVEOF

echo "Variables de entorno para sync guardadas en .env.supabase"
echo
echo "========================================"
echo "   CONFIGURACION COMPLETADA!"
echo "========================================"
echo
echo "Para ejecutar localmente:"
echo "  npm run dev"
echo
echo "Para sincronizar con Polymarket:"
echo "  source .env.supabase && python3 push_to_supabase.py"
echo
echo "Para deploy a Vercel:"
echo "  1. npx vercel env add NEXT_PUBLIC_SUPABASE_URL"
echo "  2. npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  3. npx vercel --prod"
echo
