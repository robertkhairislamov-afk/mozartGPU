import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { GpuModel } from '@/lib/types'

export const GPUS_KEY = ['gpus'] as const

export function useGpus() {
  return useQuery<GpuModel[]>({
    queryKey: GPUS_KEY,
    queryFn: async () => {
      const { data } = await api.get<GpuModel[]>('/gpus/')
      return data
    },
    staleTime: 10 * 60 * 1000, // 10 min — catalog changes rarely
  })
}

export function useGpu(id: string | undefined) {
  return useQuery<GpuModel>({
    queryKey: [...GPUS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<GpuModel>(`/gpus/${id}`)
      return data
    },
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  })
}
