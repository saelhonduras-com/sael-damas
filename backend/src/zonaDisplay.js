// Quita la palabra "Zona" solo al MOSTRAR (pantalla, PDF y Excel).
// El valor guardado en la base de datos no cambia ("Zona Centro 1"), así que
// registros, filtros y el orden de los reportes siguen funcionando igual.
function nombreZona(z) {
  return String(z || '').replace(/^Zona\s+/i, '');
}

module.exports = { nombreZona };
