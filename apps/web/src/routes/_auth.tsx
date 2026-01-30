import { createFileRoute, Outlet } from '@tanstack/react-router'
import {z} from 'zod'

const searchSchema = z.object({
  redirect: z.url().optional()
})

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  validateSearch: searchSchema
})

function RouteComponent() {
  return <Outlet />
}
