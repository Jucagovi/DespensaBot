import { Tag } from 'primereact/tag';

// se representa el estado de conexión de Supabase en tiempo real.
const IndicadorConexion = ({ estado }) => {
  let severidad = 'info';
  let texto = 'Conectando...';
  let icono = 'pi pi-spin pi-spinner';

  if (estado === 'conectado') {
    severidad = 'success';
    texto = 'En vivo';
    icono = 'pi pi-bolt';
  } else if (estado === 'desconectado') {
    severidad = 'danger';
    texto = 'Desconectado';
    icono = 'pi pi-exclamation-triangle';
  }

  return (
    <Tag
      severity={severidad}
      value={texto}
      icon={icono}
      className="text-xs px-2 py-1 font-semibold"
    />
  );
};

export default IndicadorConexion;
