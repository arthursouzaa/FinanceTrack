const CHAVES_USUARIO = [
  'usuarioLogado',
  'clienteLogado',
  'usuario',
  'cliente',
  'authUser',
  'currentUser',
  'loggedUser',
  'user',
  'idUsuario',
  'idCliente',
  'userId',
  'clienteId',
];

function normalizarId(valor) {
  if (valor == null) {
    return '';
  }

  if (typeof valor === 'object') {
    return normalizarId(
      valor.id ?? valor.idCliente ?? valor.clienteId ?? valor.idUsuario ?? valor.usuarioId ?? valor.userId
    );
  }

  return String(valor).trim();
}

function extrairUsuario(objeto) {
  if (!objeto || typeof objeto !== 'object') {
    return null;
  }

  const id = normalizarId(
    objeto.id ?? objeto.idCliente ?? objeto.clienteId ?? objeto.idUsuario ?? objeto.usuarioId ?? objeto.userId
  );

  if (!id) {
    return null;
  }

  return {
    ...objeto,
    id,
  };
}

export function salvarUsuarioLogado(usuario) {
  // Se for um array, pega o ÚLTIMO cliente (o mais recente)
  const usuarioNormalizado = Array.isArray(usuario) 
    ? extrairUsuario(usuario[usuario.length - 1]) 
    : extrairUsuario(usuario);

  if (!usuarioNormalizado || typeof window === 'undefined' || !window.localStorage) {
    return usuarioNormalizado;
  }

  window.localStorage.setItem('usuarioLogado', JSON.stringify(usuarioNormalizado));
  window.localStorage.setItem('idUsuario', usuarioNormalizado.id);

  return usuarioNormalizado;
}

export function obterUsuarioLogado() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  for (const chave of CHAVES_USUARIO) {
    const valorArmazenado = window.localStorage.getItem(chave);

    if (!valorArmazenado) {
      continue;
    }

    try {
      const valorJson = JSON.parse(valorArmazenado);
      const usuario = extrairUsuario(valorJson);

      if (usuario) {
        return usuario;
      }

      const id = normalizarId(valorJson);

      if (id) {
        return { id };
      }
    } catch {
      const id = normalizarId(valorArmazenado);

      if (id) {
        return { id };
      }
    }
  }

  return null;
}

export function obterIdUsuarioLogado() {
  return obterUsuarioLogado()?.id ?? '';
}

function localizarIdRelacionamento(objeto) {
  if (!objeto || typeof objeto !== 'object') {
    return '';
  }

  const chavesRelacionamento = [
    'idCliente',
    'clienteId',
    'cliente',
    'idUsuario',
    'usuarioId',
    'usuario',
    'userId',
    'user',
  ];

  for (const chave of chavesRelacionamento) {
    if (!(chave in objeto)) {
      continue;
    }

    const valor = objeto[chave];

    if (valor && typeof valor === 'object') {
      const idInterno = normalizarId(
        valor.id ?? valor.idCliente ?? valor.clienteId ?? valor.idUsuario ?? valor.usuarioId ?? valor.userId
      );

      if (idInterno) {
        return idInterno;
      }
    }

    const id = normalizarId(valor);

    if (id) {
      return id;
    }
  }

  for (const [chave, valor] of Object.entries(objeto)) {
    if (!/(cliente|usuario|user)/i.test(chave)) {
      continue;
    }

    if (valor && typeof valor === 'object') {
      const idInterno = normalizarId(
        valor.id ?? valor.idCliente ?? valor.clienteId ?? valor.idUsuario ?? valor.usuarioId ?? valor.userId
      );

      if (idInterno) {
        return idInterno;
      }
    }

    const id = normalizarId(valor);

    if (id) {
      return id;
    }
  }

  return '';
}

export function filtrarRegistrosDoUsuario(registros, idUsuario = obterIdUsuarioLogado()) {
  if (!Array.isArray(registros)) {
    return [];
  }

  const temRelacionamentoUsuario = registros.some((registro) => Boolean(localizarIdRelacionamento(registro)));

  if (!idUsuario || !temRelacionamentoUsuario) {
    return registros;
  }

  return registros.filter((registro) => localizarIdRelacionamento(registro) === String(idUsuario));
}
