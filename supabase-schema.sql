-- Ejecutar en Supabase → SQL Editor → New query

create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  nombre text not null,
  empresa text not null,
  telefono text not null,
  correo text,

  -- Simulador de velocidad
  operarios_necesarios numeric,
  dias_disponibles numeric,
  dias_contratacion_directa numeric,
  horas_con_nosotros numeric,

  -- Calculadora de costos (opcional, si el cliente también la usó)
  salario numeric,
  personas numeric,
  rotacion_pct numeric,
  ausentismo_dias numeric,
  vacante_dias numeric,
  costo_oculto numeric,
  total_anual numeric
);

-- Seguridad: el sitio público solo puede INSERTAR leads, nunca leerlos.
alter table leads enable row level security;

create policy "El sitio puede registrar leads"
  on leads for insert
  to anon
  with check (true);
