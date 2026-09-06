import { createContext, useContext } from 'react';
import { useCarrito } from '../hooks/useCarrito.js';

// se crea el contexto para compartir el estado del carrito sin incurrir en props drilling.
const CarritoContext = createContext(null);

// se define el proveedor que envuelve a la aplicación o sus rutas.
const CarritoProvider = ({ children }) => {
  const estadoCarrito = useCarrito();

  return (
    <CarritoContext.Provider value={estadoCarrito}>
      {children}
    </CarritoContext.Provider>
  );
};

// se define el hook consumidor del contexto.
export const useCarritoContexto = () => {
  const contexto = useContext(CarritoContext);
  if (!contexto) {
    throw new Error('useCarritoContexto debe usarse dentro de un CarritoProvider.');
  }
  return contexto;
};

export default CarritoProvider;
