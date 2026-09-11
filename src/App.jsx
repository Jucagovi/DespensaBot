import { useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import CarritoProvider from './contextos/CarritoContexto.jsx';
import TemaProvider from './contextos/TemaContexto.jsx';
import Cabecera from './componentes/Cabecera.jsx';
import PestanaComprando from './componentes/PestanaComprando.jsx';
import PestanaHaciendoLista from './componentes/PestanaHaciendoLista.jsx';

// se define el componente principal de la aplicación con la configuración de rutas y proveedores.
const App = () => {
  const toastRef = useRef(null);

  return (
    <TemaProvider>
      <CarritoProvider>
        <div className="flex flex-column min-h-screen surface-ground">
          <Toast ref={toastRef} position="bottom-center" />
          <Cabecera />

          <main className="flex-1 overflow-y-auto pb-4">
            <Routes>
              <Route path="/" element={<Navigate to="/comprando" replace />} />
              <Route
                path="/comprando"
                element={<PestanaComprando toastRef={toastRef} />}
              />
              <Route
                path="/haciendo-lista"
                element={<PestanaHaciendoLista toastRef={toastRef} />}
              />
              <Route path="*" element={<Navigate to="/comprando" replace />} />
            </Routes>
          </main>
        </div>
      </CarritoProvider>
    </TemaProvider>
  );
};

export default App;
