import { useState, useEffect } from "react";

/**
 * Detecta se o usuário está em um dispositivo móvel
 */
export function useEhDispositivoMovel(): boolean {
  const [ehMovel, setEhMovel] = useState(false);

  useEffect(() => {
    const verificarDispositivo = () => {
      // Verificar pelo user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

      const ehMovelPorUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );

      // Verificar por touch screen
      const ehTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Verificar por tamanho de tela (mobile geralmente < 768px)
      const ehTelaMovel = window.innerWidth < 768;

      // Considerar móvel se atender pelo menos 2 critérios
      const criterios = [ehMovelPorUserAgent, ehTouchScreen, ehTelaMovel];
      const criteriosAtendidos = criterios.filter(Boolean).length;

      setEhMovel(criteriosAtendidos >= 2);
    };

    verificarDispositivo();

    // Verificar novamente se a tela for redimensionada
    window.addEventListener('resize', verificarDispositivo);
    return () => window.removeEventListener('resize', verificarDispositivo);
  }, []);

  return ehMovel;
}

/**
 * Verifica se o navegador suporta acesso à câmera
 */
export function navegadorSuportaCamera(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

/**
 * Verifica se o dispositivo tem câmera traseira e frontal
 */
export async function verificarCamerasDisponiveis(): Promise<{
  frontal: boolean;
  traseira: boolean;
}> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    return {
      frontal: videoDevices.some(d => d.label.toLowerCase().includes('front')),
      traseira: videoDevices.some(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')),
    };
  } catch {
    return { frontal: false, traseira: false };
  }
}
