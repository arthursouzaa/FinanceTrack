const CHAVE_TOKEN = '_financetrack_token';
const CHAVE_USUARIO = '_financetrack_user';


export function salvarUsuarioLogado(dadosAutenticacao) {
  if (!dadosAutenticacao || typeof window === 'undefined') return;

  const { token, id, nome, email } = dadosAutenticacao;

  if (token) {
    localStorage.setItem(CHAVE_TOKEN, token);
  }
  
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ id, nome, email }));
}

export function obterUsuarioLogado() {
  if (typeof window === 'undefined') return null;

  const usuarioJson = localStorage.getItem(CHAVE_USUARIO);
  try {
    return usuarioJson ? JSON.parse(usuarioJson) : null;
  } catch (error) {
    console.error("Erro ao ler usuário do localStorage", error);
    return null;
  }
}

export function obterIdUsuarioLogado() {
  const usuario = obterUsuarioLogado();
  return usuario?.id ? String(usuario.id) : '';
}


export function filtrarRegistrosDoUsuario(registros, idUsuarioAtual = obterIdUsuarioLogado()) {
  if (!Array.isArray(registros)) return [];
  if (!idUsuarioAtual) return registros;

  return registros.filter((registro) => {
    const idDoRegistro = 
      registro.idCliente ?? 
      registro.clienteId ?? 
      registro.cliente?.id ?? 
      registro.idUsuario ?? 
      registro.usuario?.id;
      
    return String(idDoRegistro) === String(idUsuarioAtual);
  });
}

export function deslogarUsuario() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}