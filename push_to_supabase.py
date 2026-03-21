#!/usr/bin/env python3
"""
Script para sincronizar estado de Polymarket con Supabase
Ejecutar con: python3 push_to_supabase.py

Requiere: pip install supabase
"""

import json
import os
import time
from supabase import create_client

# Configurar estas variables
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
POLYMARKET_STATE_FILE = '/home/xmanel/.openclaw/workspace/polymarket_state.json'
SYNC_INTERVAL = 30  # segundos

def load_polymarket_state():
    try:
        with open(POLYMARKET_STATE_FILE) as f:
            return json.load(f)
    except:
        return None

def push_to_supabase(state):
    if not SUPABASE_URL or not SUPABASE_KEY:
        print('ERROR: Configurar SUPABASE_URL y SUPABASE_KEY')
        return False
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        data = {
            'id': 1,
            'positions': state.get('positions', {}),
            'balance': state.get('balance', 0)
        }
        
        result = supabase.table('polymarket_state').upsert(data).execute()
        print(f'[{time.strftime("%H:%M:%S")}] Sincronizado: {len(data["positions"])} posiciones')
        return True
    except Exception as e:
        print(f'Error: {e}')
        return False

def main():
    print('=== MANEL TERMINAL - Sync to Supabase ===')
    print(f'Archivo: {POLYMARKET_STATE_FILE}')
    print(f'Intervalo: {SYNC_INTERVAL}s')
    print()
    
    while True:
        state = load_polymarket_state()
        if state:
            push_to_supabase(state)
        else:
            print('Esperando datos de Polymarket...')
        
        time.sleep(SYNC_INTERVAL)

if __name__ == '__main__':
    main()
