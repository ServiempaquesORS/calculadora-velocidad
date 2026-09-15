function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

const supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
emailjs.init({ publicKey: CONFIG.EMAILJS_PUBLIC_KEY });

let ultimaVelocidad = null;
let ultimoCalculo = null;

// ---------- Simulador de velocidad ----------
document.getElementById('calcularVelocidad').addEventListener('click', () => {
  const operarios = parseFloat(document.getElementById('operarios').value) || 0;
  const diasDisponibles = parseFloat(document.getElementById('diasDisponibles').value) || 0;

  const diasReclutamiento = parseFloat(document.getElementById('diasReclutamiento').value) || 0;
  const diasSeleccion = parseFloat(document.getElementById('diasSeleccion').value) || 0;
  const diasExamenes = parseFloat(document.getElementById('diasExamenes').value) || 0;
  const diasAfiliacion = parseFloat(document.getElementById('diasAfiliacion').value) || 0;
  const diasInduccion = parseFloat(document.getElementById('diasInduccion').value) || 0;
  const horasNosotros = parseFloat(document.getElementById('diasNosotros').value) || 48;

  if (operarios <= 0) {
    document.getElementById('operarios').focus();
    return;
  }

  const totalDirecto = diasReclutamiento + diasSeleccion + diasExamenes + diasAfiliacion + diasInduccion;
  const totalNosotrosDias = horasNosotros / 24;
  const diferencia = totalDirecto - totalNosotrosDias;

  document.getElementById('diferenciaDias').textContent = `${Math.round(diferencia)} días más rápido`;
  document.getElementById('totalDirecto').textContent = `${totalDirecto} días`;
  document.getElementById('totalNosotros').textContent = `${horasNosotros} horas`;

  const maxDias = Math.max(totalDirecto, totalNosotrosDias, 1);
  document.getElementById('barraDirecta').style.width = `${Math.max((totalDirecto / maxDias) * 100, 6)}%`;
  document.getElementById('barraNosotros').style.width = `${Math.max((totalNosotrosDias / maxDias) * 100, 6)}%`;

  const nota = document.getElementById('notaVelocidad');
  if (diasDisponibles > 0 && diasDisponibles < totalDirecto) {
    const perdidos = Math.round(totalDirecto - diasDisponibles);
    nota.textContent = `Si necesita sus ${operarios} operarios en ${diasDisponibles} días: contratando directo tardaría ${totalDirecto} días — unos ${perdidos} días de producción sin cubrir. Con nosotros, los tiene en planta en ${horasNosotros} horas.`;
  } else {
    nota.textContent = `Contratando directo, sus ${operarios} operarios estarían listos en ${totalDirecto} días. Con nosotros, en ${horasNosotros} horas.`;
  }

  ultimaVelocidad = {
    operarios_necesarios: operarios,
    dias_disponibles: diasDisponibles,
    dias_contratacion_directa: totalDirecto,
    horas_con_nosotros: horasNosotros
  };

  const resultado = document.getElementById('resultadoVelocidad');
  resultado.hidden = false;
  resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ---------- Calculadora de costos (secundaria) ----------
document.getElementById('calcular').addEventListener('click', () => {
  const salario = parseFloat(document.getElementById('salario').value) || 0;
  const personas = parseFloat(document.getElementById('personas').value) || 1;
  const rotacionPct = (parseFloat(document.getElementById('rotacion').value) || 0) / 100;
  const diasAusentismo = parseFloat(document.getElementById('ausentismo').value) || 0;
  const diasVacante = parseFloat(document.getElementById('vacante').value) || 0;
  const parafiscalesPct = (parseFloat(document.getElementById('parafiscales').value) || 0) / 100;
  const mesesReemplazo = parseFloat(document.getElementById('reemplazo').value) || 0;

  if (salario <= 0) {
    document.getElementById('salario').focus();
    return;
  }

  const salarioDiario = salario / 30;
  const base = salario * 12;
  const parafiscales = base * parafiscalesPct;
  const costoRotacion = (salario * mesesReemplazo) * rotacionPct;
  const costoAusentismo = salarioDiario * diasAusentismo;
  const costoSeleccion = salarioDiario * diasVacante;

  const totalPorPersona = base + parafiscales + costoRotacion + costoAusentismo + costoSeleccion;
  const costoOcultoPorPersona = totalPorPersona - base;
  const total = totalPorPersona * personas;
  const costoOculto = costoOcultoPorPersona * personas;

  document.getElementById('costoOculto').textContent = formatCOP(costoOculto);
  document.getElementById('bSalario').textContent = formatCOP(base * personas);
  document.getElementById('bParafiscales').textContent = formatCOP(parafiscales * personas);
  document.getElementById('bRotacion').textContent = formatCOP(costoRotacion * personas);
  document.getElementById('bAusentismo').textContent = formatCOP(costoAusentismo * personas);
  document.getElementById('bSeleccion').textContent = formatCOP(costoSeleccion * personas);
  document.getElementById('bTotal').textContent = formatCOP(total);

  ultimoCalculo = {
    salario, personas, rotacion_pct: rotacionPct * 100, ausentismo_dias: diasAusentismo,
    vacante_dias: diasVacante, costo_oculto: costoOculto, total_anual: total
  };

  document.getElementById('resultado').hidden = false;
});

// ---------- Captura de lead (unificada) ----------
document.getElementById('enviarLead').addEventListener('click', async () => {
  const nombre = document.getElementById('leadNombre').value.trim();
  const empresa = document.getElementById('leadEmpresa').value.trim();
  const telefono = document.getElementById('leadTelefono').value.trim();
  const correo = document.getElementById('leadCorreo').value.trim();
  const status = document.getElementById('leadStatus');

  if (!nombre || !empresa || !telefono) {
    status.textContent = 'Por favor complete nombre, empresa y teléfono.';
    return;
  }

  const boton = document.getElementById('enviarLead');
  boton.disabled = true;
  status.textContent = 'Enviando...';

  const lead = {
    nombre, empresa, telefono, correo,
    ...(ultimoCalculo || {}),
    ...(ultimaVelocidad || {})
  };

  try {
    await supabaseClient.from('leads').insert([lead]);
  } catch (err) {
    console.error('Error guardando en Supabase:', err);
  }

  try {
    await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, {
      to_email: CONFIG.NOTIFICATION_EMAIL,
      lead_nombre: nombre,
      lead_empresa: empresa,
      lead_telefono: telefono,
      lead_correo: correo || 'No proporcionado',
      dias_contratacion_directa: ultimaVelocidad ? `${ultimaVelocidad.dias_contratacion_directa} días` : 'No calculado',
      costo_oculto: ultimoCalculo ? formatCOP(ultimoCalculo.costo_oculto) : 'No calculado'
    });
  } catch (err) {
    console.error('Error enviando correo:', err);
  }

  let mensaje = `Hola, soy ${nombre} de ${empresa}.`;
  if (ultimaVelocidad) {
    mensaje += ` Usé el simulador de velocidad: necesito ${ultimaVelocidad.operarios_necesarios} operarios y contratando directo tardaría ${ultimaVelocidad.dias_contratacion_directa} días.`;
  }
  mensaje += ` Quisiera una cotización. Mi teléfono: ${telefono}`;
  const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  status.textContent = '¡Listo! Abrimos WhatsApp para que continúe la conversación.';
  boton.disabled = false;
});
