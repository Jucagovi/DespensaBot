import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

// se representa el formulario para introducir nuevos productos en el catálogo de la despensa.
const FormularioCrearProducto = ({ alCrearProducto, cargando }) => {
  const [nombre, setNombre] = useState('');

  const manejarEnvio = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const nombreLimpio = nombre.trim();
    if (nombreLimpio) {
      alCrearProducto(nombreLimpio);
      setNombre('');
    }
  };

  return (
    <div className="surface-card p-3 border-round-xl shadow-1">
      <h2 className="text-sm font-semibold text-900 m-0 mb-3 flex align-items-center gap-2">
        <i className="pi pi-plus-circle text-primary" />
        Introducir producto a la lista
      </h2>
      <form onSubmit={manejarEnvio} className="flex gap-2 align-items-center">
        <InputText
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del producto (ej: Leche)"
          className="flex-1 border-round-lg text-base p-inputtext-holgado"
          disabled={cargando}
        />
        <Button
          type="submit"
          label="Añadir"
          icon="pi pi-plus"
          loading={cargando}
          className="p-button-primary flex-shrink-0 border-round-lg font-semibold boton-anadir-grande"
        />
      </form>
    </div>
  );
};

export default FormularioCrearProducto;
