import { create } from 'zustand';
import { db } from '../db/database';
import { plantoes } from '../db/schema';
import { eq } from 'drizzle-orm';

interface Plantao {
  id: string;
  inicio: Date;
  fim: Date;
  local: string;
  contratante: string;
  tipo: string;
  valorBruto: number;
  valorLiquido?: number;
  statusPgto: string;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: string;
}

interface PlantoesStore {
  plantoes: Plantao[];
  isLoading: boolean;
  error: string | null;
  getPlantoes: () => Promise<Plantao[]>;
  addPlantao: (plantao: Omit<Plantao, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<void>;
  updatePlantao: (id: string, plantao: Partial<Plantao>) => Promise<void>;
  deletePlantao: (id: string) => Promise<void>;
}

export const plantoesStore = create<PlantoesStore>((set, get) => ({
  plantoes: [],
  isLoading: false,
  error: null,

  getPlantoes: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.select().from(plantoes).orderBy(plantoes.inicio);
      set({ plantoes: result, isLoading: false });
      return result;
    } catch (error) {
      set({ error: 'Erro ao carregar plantões', isLoading: false });
      throw error;
    }
  },

  addPlantao: async (plantao) => {
    set({ isLoading: true, error: null });
    try {
      const newPlantao = {
        ...plantao,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'PENDING',
      };
      
      await db.insert(plantoes).values(newPlantao);
      
      set((state) => ({
        plantoes: [...state.plantoes, newPlantao],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Erro ao adicionar plantão', isLoading: false });
      throw error;
    }
  },

  updatePlantao: async (id, plantao) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPlantao = {
        ...plantao,
        updatedAt: new Date(),
        syncStatus: 'PENDING',
      };
      
      await db.update(plantoes)
        .set(updatedPlantao)
        .where(eq(plantoes.id, id));
      
      set((state) => ({
        plantoes: state.plantoes.map(p => 
          p.id === id ? { ...p, ...updatedPlantao } : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Erro ao atualizar plantão', isLoading: false });
      throw error;
    }
  },

  deletePlantao: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.delete(plantoes).where(eq(plantoes.id, id));
      
      set((state) => ({
        plantoes: state.plantoes.filter(p => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Erro ao deletar plantão', isLoading: false });
      throw error;
    }
  },
}));
