import { api } from './api';

export async function solicitarHash(documentoId: string) {
  const { data } = await api.post(`/assinatura/${documentoId}/request`, {});
  return data; // { hashHex, hashAlgo, callbackUrl }
}

export async function enviarCallback(documentoId: string, body: {
  formato: 'PAdES'|'CMS', 
  assinaturaBase64: string, 
  certificadoPem?: string, 
  cadeiaPem?: string[], 
  algoritimo?: string, 
  signerName?: string,
  timestampToken?: string
}) {
  const { data } = await api.post(`/assinatura/${documentoId}/callback`, body);
  return data;
}

export async function urlAssinado(documentoId: string) {
  const { data } = await api.get(`/assinatura/${documentoId}/url`);
  return data; // { url, expires, formato }
}
