import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

// se representa el campo de búsqueda rápida para filtrar productos por prefijo de palabra.
const BuscadorProductos = ({ filtroTexto, alCambiarFiltro, alLimpiarFiltro }) => {
  return (
    <div className="surface-card p-3 border-round-xl shadow-1">
      <div className="flex gap-2 align-items-center">
        <InputText
          value={filtroTexto}
          onChange={(e) => alCambiarFiltro(e.target.value)}
          placeholder="Filtrar productos..."
          className="flex-1 border-round-lg text-base p-inputtext-holgado"
          aria-label="Filtrar productos por nombre"
        />
        <Button
          type="button"
          label="Quitar filtro"
          icon="pi pi-filter-slash"
          onClick={alLimpiarFiltro}
          disabled={!filtroTexto}
          outlined
          severity="secondary"
          className="flex-shrink-0 border-round-lg font-semibold boton-limpiar-filtro"
          aria-label="Quitar filtro de productos"
        />
      </div>
    </div>
  );
};

export default BuscadorProductos;
