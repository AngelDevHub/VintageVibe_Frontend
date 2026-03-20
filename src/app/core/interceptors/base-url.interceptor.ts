import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { environment } from '../../../environments/environment';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // Si estamos en el servidor (SSR), usamos el nombre del contenedor de Docker 'backend'
  // Si estamos en el cliente (Navegador), usamos la URL configurada (localhost o relativa)
  if (isPlatformServer(platformId) && !req.url.startsWith('http')) {
    const serverUrl = 'http://backend:8080';
    const apiReq = req.clone({
      url: `${serverUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`
    });
    return next(apiReq);
  }

  // Si la URL ya es absoluta o estamos en el cliente, no modificamos nada 
  // (o podrías normalizar localhost aquí si es necesario)
  return next(req);
};
