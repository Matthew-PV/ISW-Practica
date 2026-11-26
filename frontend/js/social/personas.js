// Búsqueda de personas: la pestaña «Personas» de Explorar. Cada resultado lleva al perfil público de esa
// persona en /paginas/social/usuario.html. Expone `buscarPersonas(texto)`. Usa `api` de shared/api.js y
// `crearEnlacePerfil`, `crearBotonesAmistad` y `mostrarErrorConReintento` de shared/pantalla.js.

(() => {
  // El servidor no devuelve más
  const MAXIMO_PERSONAS = 20;

  // Texto de la relación con quien busca
  const ETIQUETAS_AMISTAD = { enviada: 'Solicitud enviada', recibida: 'Te ha enviado una solicitud', amigos: 'Amigos' };

  // Hace la petición de amistad de la fila y, si sale bien, la pinta con la relación nueva. `id` es el de la
  // amistad, que el servidor devuelve al crearla.
  async function actuarSobreAmistad(fila, usuario, boton, peticion, relacionNueva) {
    boton.disabled = true;
    fila.querySelector('[role="alert"]')?.remove();
    try {
      const { ruta, opciones } = peticion;
      const respuesta = await api(ruta, opciones);
      const amistadId = relacionNueva.amistad === 'enviada' ? respuesta.id : null;
      // Seguir o dejar de seguir no cambia la amistad ni su id
      pintarRelacion(fila, usuario, { ...usuario.relacion, ...(relacionNueva.amistad && { amistadId }), ...relacionNueva });
      desactivarUnInstante([...fila.querySelectorAll('button')]);
    } catch (err) {
      boton.disabled = false;
      // La relación cambió en otro sitio: se vuelve a pedir antes de enseñar el mensaje
      if (err.status === 400 || err.status === 404) {
        const perfil = await api(`/usuarios/${encodeURIComponent(usuario.nombreUsuario)}`).catch(() => null);
        if (perfil?.relacion) pintarRelacion(fila, usuario, perfil.relacion);
      }
      const error = document.createElement('p');
      error.className = 'fila-resultado-error';
      error.setAttribute('role', 'alert');
      error.textContent = err.message;
      fila.append(error);
    }
  }

  // Pone en la fila la relación (texto) y el botón que corresponde: «Añadir amigo» si no hay amistad,
  // «Cancelar solicitud» si la envió quien busca y «Aceptar» y «Rechazar» si la recibió; un amigo no lleva botón de
  // amistad. Todas llevan «Seguir» o «Dejar de seguir».
  function pintarRelacion(fila, usuario, relacion) {
    usuario.relacion = relacion;
    fila.querySelector('.fila-resultado-relacion')?.remove();
    fila.querySelector('[role="alert"]')?.remove();

    const zona = document.createElement('div');
    zona.className = 'fila-resultado-relacion';
    const etiquetas = [ETIQUETAS_AMISTAD[relacion.amistad], relacion.siguiendo ? 'Le sigues' : null].filter(Boolean);
    if (etiquetas.length) {
      const texto = document.createElement('span');
      texto.className = 'fila-resultado-estado';
      texto.textContent = etiquetas.join(' · ');
      zona.append(texto);
    }

    // Desde el buscador no se elimina a un amigo: eso se hace en su perfil
    if (relacion.amistad !== 'amigos') {
      const ruta = `/amistades/${relacion.amistadId}`;
      const responder = (aceptar) => [{ ruta, opciones: { method: 'PATCH', body: JSON.stringify({ aceptar }) } },
        { amistad: aceptar ? 'amigos' : 'ninguna' }];
      const peticiones = {
        pedir: () => [{ ruta: '/amistades', opciones: { method: 'POST', body: JSON.stringify({ destinatarioId: usuario.id }) } },
          { amistad: 'enviada' }],
        cancelar: () => [{ ruta, opciones: { method: 'DELETE' } }, { amistad: 'ninguna' }],
        aceptar: () => responder(true),
        rechazar: () => responder(false),
      };
      zona.append(...crearBotonesAmistad(relacion.amistad, (accion, boton) =>
        actuarSobreAmistad(fila, usuario, boton, ...peticiones[accion]())));
    }
    const seguir = document.createElement('button');
    seguir.type = 'button';
    seguir.className = `btn btn-sm ${relacion.siguiendo ? 'btn-outline-secondary' : 'btn-outline-primary'}`;
    seguir.textContent = relacion.siguiendo ? 'Dejar de seguir' : 'Seguir';
    seguir.addEventListener('click', () => actuarSobreAmistad(fila, usuario, seguir,
      relacion.siguiendo
        ? { ruta: `/seguimientos/${usuario.id}`, opciones: { method: 'DELETE' } }
        : { ruta: '/seguimientos', opciones: { method: 'POST', body: JSON.stringify({ seguidoId: usuario.id }) } },
      { siguiendo: !relacion.siguiendo }));
    zona.append(seguir);
    fila.append(zona);
  }

  // Crea la fila de una persona: un enlace a su perfil público con foto, nombre y, si la hay, ciudad, y a su
  // lado la relación con quien busca y el botón de amistad. El nombre procede de otro usuario, por eso se asigna
  // con textContent y nunca como HTML.
  function crearResultado(usuario) {
    const fila = document.createElement('div');
    fila.className = 'fila-resultado';
    const enlace = crearEnlacePerfil(document.createElement('a'), usuario);
    enlace.className = 'fila-resultado-persona';

    let foto;
    if (usuario.foto) {
      foto = document.createElement('img');
      foto.src = usuario.foto;
      foto.alt = '';
    } else {
      foto = document.createElement('span');
      foto.className = 'fila-resultado-sin-foto';
    }

    const cuerpo = document.createElement('span');
    const nombre = document.createElement('span');
    nombre.className = 'fila-resultado-nombre';
    nombre.textContent = usuario.nombreUsuario;
    cuerpo.append(nombre);
    if (usuario.ciudad) {
      const ciudad = document.createElement('span');
      ciudad.className = 'fila-resultado-ciudad';
      ciudad.textContent = usuario.ciudad;
      cuerpo.append(ciudad);
    }

    enlace.replaceChildren(foto, cuerpo);
    fila.append(enlace);
    if (usuario.relacion) pintarRelacion(fila, usuario, usuario.relacion);
    return fila;
  }

  // Los resultados nuevos entran con un fundido de 150 ms; la clase se retira al acabar
  function animarEntrada(elementos) {
    for (const elemento of elementos) {
      elemento.classList.add('entrando');
      const retirar = () => elemento.classList.remove('entrando');
      elemento.addEventListener('animationend', retirar, { once: true });
      setTimeout(retirar, 300);
    }
  }

  // Pinta las personas que coinciden con el texto y devuelve cuántas son (null si no se ha buscado o ha
  // fallado). Sin texto solo se explica cómo buscar.
  async function buscarPersonas(texto) {
    if (!texto) return null;
    const lista = document.getElementById('resultados-personas');
    const cargando = document.getElementById('cargando-personas');
    const error = document.getElementById('error-personas');
    document.getElementById('ayuda-personas').classList.add('d-none');
    cargando.classList.remove('d-none');

    try {
      const usuarios = await api(`/usuarios?texto=${encodeURIComponent(texto)}`);
      const cuantas = `${usuarios.length}${usuarios.length === MAXIMO_PERSONAS ? '+' : ''}`;
      document.getElementById('pestana-personas').textContent = `Personas (${cuantas})`;
      document.getElementById('recuento-personas').textContent = `${cuantas} ${usuarios.length === 1 ? 'persona' : 'personas'}`;
      document.getElementById('sin-personas').classList.toggle('d-none', usuarios.length !== 0);
      const filas = usuarios.map(crearResultado);
      lista.replaceChildren(...filas);
      animarEntrada(filas);
      return usuarios.length;
    } catch (err) {
      mostrarErrorConReintento(error, err.message, () => buscarPersonas(texto));
      return null;
    } finally {
      cargando.classList.add('d-none');
    }
  }

  window.buscarPersonas = buscarPersonas;
})();
