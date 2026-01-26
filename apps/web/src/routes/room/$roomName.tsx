import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/room/$roomName')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/room/$roomName"!</div>
}
