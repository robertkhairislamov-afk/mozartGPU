import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { BalanceResponse, DepositRequest, DepositResponse, Invoice } from '@/lib/types'

const INVOICES_KEY = ['billing', 'invoices'] as const
const BALANCE_KEY = ['billing', 'balance'] as const

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: INVOICES_KEY,
    queryFn: async () => {
      const { data } = await api.get<Invoice[]>('/billing/invoices')
      return data
    },
  })
}

export function useBalance() {
  return useQuery<BalanceResponse>({
    queryKey: BALANCE_KEY,
    queryFn: async () => {
      const { data } = await api.get<BalanceResponse>('/billing/balance')
      return data
    },
    refetchInterval: 60 * 1000, // refresh every minute
  })
}

export function useDeposit() {
  const queryClient = useQueryClient()
  return useMutation<DepositResponse, Error, DepositRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post<DepositResponse>('/billing/deposit', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY })
      queryClient.invalidateQueries({ queryKey: BALANCE_KEY })
    },
  })
}
