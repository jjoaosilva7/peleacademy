/*
 * Links para abrir a rota até o local da peneira nos apps de mobilidade.
 * São links universais: abrem o app se estiver instalado ou o site no navegador.
 */
import type { Peneira } from '../tipos';

export interface OpcaoRota {
  id: 'uber' | 'moovit' | 'waze' | 'maps';
  nome: string;
  descricao: string;
  url: string;
}

export function opcoesDeRota(p: Pick<Peneira, 'local' | 'endereco' | 'cidade' | 'uf' | 'lat' | 'lng'>): OpcaoRota[] {
  const nome = encodeURIComponent(p.local);
  const endereco = encodeURIComponent(`${p.endereco}, ${p.cidade} - ${p.uf}`);
  return [
    {
      id: 'uber',
      nome: 'Uber',
      descricao: 'Carro até a porta',
      url:
        `https://m.uber.com/ul/?action=setPickup&pickup=my_location` +
        `&dropoff[latitude]=${p.lat}&dropoff[longitude]=${p.lng}` +
        `&dropoff[nickname]=${nome}&dropoff[formatted_address]=${endereco}`,
    },
    {
      id: 'moovit',
      nome: 'Moovit',
      descricao: 'Ônibus, metrô e trem',
      url: `https://moovit.com/?to=${nome}&tll=${p.lat}_${p.lng}&lang=pt`,
    },
    {
      id: 'waze',
      nome: 'Waze',
      descricao: 'Dirigindo, com trânsito',
      url: `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`,
    },
    {
      id: 'maps',
      nome: 'Google Maps',
      descricao: 'Ver no mapa',
      url: `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
    },
  ];
}
