import { apiGet, apiPostJson, apiUrl } from './client'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface BookingDTO {
  id: number
  customerId: number
  customerName: string
  specialistId: number
  specialistName: string
  timeSlotId: number
  startTime: string
  endTime: string
  topic: string
  notes: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED'
  amount: number
  createdAt: string
}

export interface Specialist {
  id: number
  name: string
}

export interface TimeSlotDTO {
  id: number
  specialistId: number
  specialistName: string
  startTime: string
  endTime: string
  available: boolean
}

export interface BookingRequest {
  specialistId: number
  timeSlotId: number
  topic: string
  notes: string
}

export async function fetchAppointments(status?: string): Promise<BookingDTO[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const res = await apiGet<ApiResponse<BookingDTO[]>>(`/api/bookings${query}`)
  return res.data ?? []
}

export async function fetchSpecialists(): Promise<Specialist[]> {
  const res = await apiGet<ApiResponse<Specialist[]>>('/api/specialists/active')
  return res.data ?? []
}

export async function fetchAvailableSlots(specialistId: number): Promise<TimeSlotDTO[]> {
  const res = await apiGet<ApiResponse<TimeSlotDTO[]>>(`/api/slots/available/from-now?specialistId=${specialistId}`)
  return res.data ?? []
}

export async function createAppointment(customerId: number, body: BookingRequest): Promise<BookingDTO> {
  const path = `/api/bookings?customerId=${customerId}`
  const res = await apiPostJson<BookingRequest, ApiResponse<BookingDTO>>(path, body)
  return res.data
}

async function putNoBody(path: string): Promise<void> {
  const res = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
}

export async function confirmAppointment(id: number): Promise<void> {
  await putNoBody(`/api/bookings/${id}/confirm`)
}

export async function cancelAppointment(id: number): Promise<void> {
  await putNoBody(`/api/bookings/${id}/cancel`)
}
