import { createContext, useContext, useState, useEffect } from 'react';

// se crea el contexto para administrar el tema visual claro u oscuro.
const TemaContext = createContext(null);

// se define el proveedor para gestionar la persistencia y alternancia del tema.
const TemaProvider = ({ children }) => {
  const [esModoOscuro, setEsModoOscuro] = useState(() => {
    const preferenciaGuardada =
      localStorage.getItem('tema_despensabot') || localStorage.getItem('tema_cesta');
    if (preferenciaGuardada !== null) {
      return preferenciaGuardada === 'oscuro';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // se sincroniza la clase en el elemento raíz del documento al cambiar el estado.
  useEffect(() => {
    const raiz = document.documentElement;
    const cuerpo = document.body;

    if (esModoOscuro) {
      raiz.classList.add('modo-oscuro');
      cuerpo.classList.add('modo-oscuro');
      localStorage.setItem('tema_despensabot', 'oscuro');
    } else {
      raiz.classList.remove('modo-oscuro');
      cuerpo.classList.remove('modo-oscuro');
      localStorage.setItem('tema_despensabot', 'claro');
    }
  }, [esModoOscuro]);

  // se conmuta entre el tema claro y oscuro.
  const conmutarTema = () => {
    setEsModoOscuro((prev) => !prev);
  };

  return (
    <TemaContext.Provider value={{ esModoOscuro, conmutarTema }}>
      {children}
    </TemaContext.Provider>
  );
};

// se define el hook de consumo del contexto de tema.
export const useTemaContexto = () => {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error('useTemaContexto debe usarse dentro de un TemaProvider.');
  }
  return contexto;
};

export default TemaProvider;
