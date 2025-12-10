import { Service } from "@/types";

// Serviços oferecidos pela plataforma - configuração estática
export const SERVICES: Service[] = [
    { id: 'REGULAR', name: 'Limpeza Regular', description: 'Manutenção do dia a dia', basePrice: 12, icon: 'Sparkles' },
    { id: 'DEEP', name: 'Limpeza Profunda', description: 'Limpeza completa e detalhada', basePrice: 15, icon: 'Droplet' },
    { id: 'POST_OBRA', name: 'Pós Obra', description: 'Limpeza após construção/reforma', basePrice: 20, icon: 'Hammer' },
    { id: 'MOVING', name: 'Mudança', description: 'Limpeza pré/pós mudança', basePrice: 18, icon: 'Box' },
];
