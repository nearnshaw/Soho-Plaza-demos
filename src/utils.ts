import { Vector3, Color4 } from '@dcl/sdk/math'
import {
  engine,
  Transform,
  MeshRenderer,
  MeshCollider,
  pointerEventsSystem,
  InputAction,
  EventSystemCallback
} from '@dcl/sdk/ecs'

export function createClickableCube(position: Vector3, hoverText: string, callback: EventSystemCallback) {
  const cube = engine.addEntity()
  Transform.create(cube, {
    position: position,
    scale: Vector3.create(0.5, 0.5, 0.5)
  })
  MeshRenderer.setBox(cube)
  MeshCollider.setBox(cube)
  pointerEventsSystem.onPointerDown(
    {
      entity: cube,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: hoverText
      }
    },
    callback
  )
}

export function getRandomHexColor(): Color4 {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return Color4.fromHexString(color)
}
