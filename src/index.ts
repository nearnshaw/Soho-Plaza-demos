import { Vector3, Color3, Quaternion, Color4 } from '@dcl/sdk/math'
import {
  engine,
  Transform,
  Entity,
  Material,
  GltfNodeModifiers,
  pointerEventsSystem,
  InputAction,
  Animator,
  VideoPlayer
} from '@dcl/sdk/ecs'
import { LightSource } from '@dcl/sdk/ecs'
import { EntityNames } from '../assets/scene/entity-names'
import { createClickableCube, getRandomHexColor } from './utils'

// Store original rotations
const originalRotations = new Map<Entity, Quaternion>()

// System to oscillate spotlights
function oscillateSpotlights(dt: number) {
  const time = Date.now() / 1000 // Current time in seconds
  const amplitude = 15 // Degrees (half of 30-degree arc)
  const speed = 0.3 // Oscillations per second

  for (const [entity, originalRotation] of originalRotations) {
    const oscillation = Math.sin(time * speed * Math.PI * 2) * amplitude
    Transform.getMutable(entity).rotation = Quaternion.fromEulerDegrees(
      originalRotation.x,
      originalRotation.y + oscillation,
      originalRotation.z
    )
  }
}

export function main() {
  ////////////////////////////////
  //// Lights
  ////////////////////////////////
  const light_ref = engine.getEntityByName<EntityNames>(EntityNames.Light_Ref)
  const light_ref2 = engine.getEntityByName<EntityNames>(EntityNames.Light_Ref_2)
  const light_ref3 = engine.getEntityByName<EntityNames>(EntityNames.Light_Ref_3)
  const light_ref4 = engine.getEntityByName<EntityNames>(EntityNames.Light_Ref_4)

  // simple spot light
  LightSource.create(light_ref, {
    type: {
      $case: 'spot',
      spot: {
        innerAngle: 30,
        outerAngle: 60
      }
    },
    intensity: 100000
  })

  // Simple point light
  LightSource.create(light_ref2, {
    type: {
      $case: 'point',
      point: {}
    },
    intensity: 100000
  })

  // Red intensity spot light
  LightSource.create(light_ref3, {
    type: {
      $case: 'spot',
      spot: {
        innerAngle: 30,
        outerAngle: 60
      }
    },
    color: Color3.Red(),
    intensity: 1000000,
    shadow: true
  })

  // Spotlight with a shadow mask
  LightSource.create(light_ref4, {
    type: {
      $case: 'spot',
      spot: {
        innerAngle: 30,
        outerAngle: 60
      }
    },
    shadow: true,
    intensity: 1000000,
    color: Color3.Magenta(),
    shadowMaskTexture: Material.Texture.Common({ src: 'assets/scene/images/lightmask1.png' })
  })

  ////////////////////////////////
  //// Material Swapping
  ////////////////////////////////

  const big_model = engine.getEntityByName<EntityNames>(EntityNames.sohoscene_glb)

  // Change the color of the TRex
  GltfNodeModifiers.create(big_model, {
    modifiers: [
      {
        path: 'TRex',
        material: {
          material: {
            $case: 'pbr',
            pbr: {
              albedoColor: Color4.Red()
            }
          }
        }
      },
      {
        path: 'TRex.001',
        material: {
          material: {
            $case: 'pbr',
            pbr: {
              albedoColor: Color4.Magenta(),
              emissiveColor: Color3.Magenta(),
              emissiveIntensity: 1
            }
          }
        }
      }
    ]
  })

  // swap colors of the TRex
  createClickableCube(Vector3.create(85, 1, 70), 'Random color', () => {
    const randomColor1 = getRandomHexColor()
    const randomColor2 = getRandomHexColor()
    GltfNodeModifiers.createOrReplace(big_model, {
      modifiers: [
        {
          path: 'TRex',
          material: {
            material: {
              $case: 'pbr',
              pbr: {
                albedoColor: randomColor1
              }
            }
          }
        },
        {
          path: 'TRex.001',
          material: {
            material: {
              $case: 'pbr',
              pbr: {
                albedoColor: randomColor2,
                emissiveColor: randomColor2,
                emissiveIntensity: 1
              }
            }
          }
        }
      ]
    })
  })

  // Wen Moon
  const wenMoon = engine.getEntityByName<EntityNames>(EntityNames.wenmoon)

  // Random color Wen Moon
  createClickableCube(Vector3.create(65, 1, 40), 'Random color', () => {
    GltfNodeModifiers.createOrReplace(wenMoon, {
      modifiers: [
        {
          path: '',
          material: {
            material: {
              $case: 'pbr',
              pbr: {
                albedoColor: getRandomHexColor(),
                metallic: 0,
                roughness: 0.5
              }
            }
          }
        }
      ]
    })
  })

  // Blink Wen Moon
  createClickableCube(Vector3.create(66, 1, 40), 'Blink', () => {
    if (GltfNodeModifiers.has(wenMoon)) {
      GltfNodeModifiers.deleteFrom(wenMoon)
    } else {
      GltfNodeModifiers.createOrReplace(wenMoon, {
        modifiers: [
          {
            path: 'M_Head_BaseMesh',
            material: {
              material: {
                $case: 'pbr',
                pbr: {
                  texture: Material.Texture.Common({
                    src: 'assets/scene/images/wenmoon-blink.png'
                  }),
                  metallic: 0.02,
                  roughness: 0.75
                }
              }
            }
          }
        ]
      })
    }
  })

  // Reset Wen Moon
  createClickableCube(Vector3.create(60, 1, 40), 'Reset', () => {
    GltfNodeModifiers.deleteFrom(wenMoon)
  })

  // Shark
  const shark = engine.getEntityByName<EntityNames>(EntityNames.shark)

  // Toggle shark animations
  let clickCounter = 0

  pointerEventsSystem.onPointerDown(
    {
      entity: shark,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Animate!'
      }
    },
    () => {
      if (clickCounter === 0) {
        clickCounter = 1
        Animator.playSingleAnimation(shark, 'swim')
      } else if (clickCounter === 1) {
        clickCounter = 2
        Animator.playSingleAnimation(shark, 'bite')
      } else if (clickCounter === 2) {
        clickCounter = 3
        Animator.playSingleAnimation(shark, 'swim')
        let animation = Animator.getClip(shark, 'bite')
        animation.playing = true
      } else {
        Animator.stopAllAnimations(shark)
        clickCounter = 0
      }
    }
  )

  // Add video player to the shark
  VideoPlayer.create(shark, {
    src: 'https://player.vimeo.com/external/1027418923.m3u8?s=b012663ac0ca957d28cd360bea9ebb02bf02b5f2&logging=false',
    playing: true
  })

  // VIDEO on ALL the Shark
  createClickableCube(Vector3.create(52, 1, 47), 'VIDEO on ALL the Shark', () => {
    GltfNodeModifiers.createOrReplace(shark, {
      modifiers: [
        {
          path: '',
          material: {
            material: {
              $case: 'pbr',
              pbr: {
                texture: Material.Texture.Video({ videoPlayerEntity: shark })
              }
            }
          }
        }
      ]
    })
  })

  // VIDEO on Shark's Back
  createClickableCube(Vector3.create(50, 1, 47), "VIDEO on Shark's Back", () => {
    GltfNodeModifiers.createOrReplace(shark, {
      modifiers: [
        {
          path: 'Scene_root/shark_skeleton/Sphere/Sphere.001/Sphere_2',
          material: {
            material: {
              $case: 'pbr',
              pbr: {
                texture: Material.Texture.Video({ videoPlayerEntity: shark })
              }
            }
          }
        }
      ]
    })
  })

  // Change shark EYEs node
  createClickableCube(Vector3.create(48, 1, 47), 'Change shark EYEs node', () => {
    const randomizedColor = getRandomHexColor()
    GltfNodeModifiers.createOrReplace(shark, {
      modifiers: [
        {
          path: 'Scene_root/shark_skeleton/Sphere/Sphere.001',
          material: {
            material: {
              $case: 'pbr',
              pbr: {
                albedoColor: randomizedColor
              }
            }
          }
        }
      ]
    })
  })

  // Disable shark shadows
  createClickableCube(Vector3.create(46, 1, 47), 'Disable shark shadows', () => {
    GltfNodeModifiers.createOrReplace(shark, {
      modifiers: [
        {
          path: '',
          castShadows: false
        }
      ]
    })
  })

  // Change ALL nodes
  createClickableCube(Vector3.create(44, 1, 47), 'Change ALL nodes', () => {
    GltfNodeModifiers.createOrReplace(shark, {
      modifiers: [
        {
          path: 'Scene_root/shark_skeleton/Sphere/Sphere.001',
          material: {
            material: {
              $case: 'pbr',
              pbr: {
                albedoColor: Color4.White(),
                emissiveIntensity: 100,
                emissiveColor: getRandomHexColor()
              }
            }
          }
        },
        {
          path: 'Scene_root/shark_skeleton/Sphere/Sphere.001/Sphere_1',
          material: {
            material: {
              $case: 'unlit',
              unlit: {
                diffuseColor: getRandomHexColor()
              }
            }
          }
        },
        {
          path: 'Scene_root/shark_skeleton/Sphere/Sphere.001/Sphere_2',
          material: {
            material: {
              $case: 'pbr',
              pbr: {
                albedoColor: getRandomHexColor()
              }
            }
          }
        },
        {
          path: 'Scene_root/shark_skeleton/Sphere/Sphere.001/Sphere_3',
          material: {
            material: {
              $case: 'pbr',
              pbr: {
                albedoColor: getRandomHexColor()
              }
            }
          }
        }
      ]
    })
  })

  // Reset Shark
  createClickableCube(Vector3.create(42, 1, 47), 'REMOVE GltfNodeModifier', () => {
    GltfNodeModifiers.deleteFrom(shark)
  })
}
