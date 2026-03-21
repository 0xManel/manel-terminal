-- MANEL TERMINAL - Schema de Supabase
-- Ejecutar esto en el SQL Editor de Supabase

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 100.00,
  starting_balance DECIMAL(10,2) DEFAULT 100.00,
  risk_profile TEXT DEFAULT 'medium',
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de trades
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES users(email),
  position_id TEXT NOT NULL,
  title TEXT,
  outcome TEXT,
  status TEXT DEFAULT 'open',
  entry_price DECIMAL(10,4),
  user_bet DECIMAL(10,4),
  user_shares DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estado de Polymarket (sincronizado desde el PC)
CREATE TABLE IF NOT EXISTS polymarket_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  positions JSONB,
  balance DECIMAL(10,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_email);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_users_balance ON users(balance DESC);

-- Habilitar Row Level Security (opcional pero recomendado)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE polymarket_state ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para la app (simplificado para demo)
CREATE POLICY Public access ON users FOR ALL USING (true);
CREATE POLICY Public access ON trades FOR ALL USING (true);
CREATE POLICY Public access ON polymarket_state FOR ALL USING (true);
