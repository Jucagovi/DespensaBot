import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

// se implementa el diálogo modal para modificar el nombre de un producto del catálogo.
const DialogoEditarNombre = ({ visible, producto, alGuardar, alCancelar }) => {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || '');
    }
  }, [producto, visible]);

  const manejarGuardar = () => {
    const nombreLimpio = nombre.trim();
    if (nombreLimpio) {
      alGuardar(nombreLimpio);
    }
  };

  return (
    <Dialog
      header="Cambiar nombre del producto"
      visible={visible}
      onHide={alCancelar}
      className="w-11 max-w-24rem border-round-2xl"
      footer={
        <div className="flex justify-content-end gap-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            text
            onClick={alCancelar}
            className="border-round-lg"
          />
          <Button
            label="Guardar"
            icon="pi pi-check"
            severity="primary"
            onClick={manejarGuardar}
            autoFocus
            className="border-round-lg"
          />
        </div>
      }
    >
      <div className="flex flex-column gap-2 pt-1 pb-1">
        <label htmlFor="nombre-editado-input" className="text-sm font-semibold text-600 mb-1">
          Nuevo nombre:
        </label>
        <InputText
          id="nombre-editado-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del producto"
          className="w-full text-base p-inputtext-holgado"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              manejarGuardar();
            }
          }}
        />
      </div>
    </Dialog>
  );
};

export default DialogoEditarNombre;
