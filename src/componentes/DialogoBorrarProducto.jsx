import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

// se implementa el diálogo modal para confirmar la eliminación permanente de un producto del catálogo.
const DialogoBorrarProducto = ({ visible, producto, alConfirmar, alCancelar }) => {
  return (
    <Dialog
      header="¿Eliminar definitivamente?"
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
            label="Eliminar"
            icon="pi pi-trash"
            severity="danger"
            onClick={alConfirmar}
            autoFocus
            className="border-round-lg"
          />
        </div>
      }
    >
      <p className="m-0 text-base text-700 line-height-3 py-2">
        ¿Seguro que deseas eliminar <strong>{producto?.nombre}</strong> de forma
        definitiva? Esta acción no se puede deshacer.
      </p>
    </Dialog>
  );
};

export default DialogoBorrarProducto;
