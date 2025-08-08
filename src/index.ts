import { Vector3, Color3, Quaternion, Color4 } from '@dcl/sdk/math'
import { engine, Transform, Entity, Material, GltfNodeModifiers } from '@dcl/sdk/ecs'
import { LightSource } from '@dcl/sdk/ecs'
import { EntityNames } from '../assets/scene/entity-names'

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

    // Lights
    const light_ref = engine.getEntityByName<EntityNames>(EntityNames.Light_Ref)
    const light_ref2 = engine.getEntityByName<EntityNames>(EntityNames.Light_Ref_2)
    const light_ref3 = engine.getEntityByName<EntityNames>(EntityNames.Light_Ref_3)
    const light_ref4 = engine.getEntityByName<EntityNames>(EntityNames.Light_Ref_4)
    
    // simple spot light
    LightSource.create(light_ref, {
        type: {
            $case: 'spot',
            spot: {
                innerAngle : 30,
                outerAngle : 60,
            }
        },
        intensity: 100000,
    })

    // Simple point light
    LightSource.create(light_ref2, {
        type: {
            $case: 'point',
            point: {}
        },
        intensity: 100000,
    })

    // Red intensity spot light
    LightSource.create(light_ref3, {
        type: {
            $case: 'spot',
            spot: {
                innerAngle : 30,
                outerAngle : 60,
            }
        },
        color: Color3.Red(),
        intensity: 1000000,
        shadow: true,
    })

    // Spotlight with a shadow mask
    LightSource.create(light_ref4, {
        type: {
            $case: 'spot',
            spot: {
                innerAngle : 30,
                outerAngle : 60,
            }
        },
        shadow: true,
        intensity: 1000000,
        color: Color3.Magenta(),
        shadowMaskTexture: Material.Texture.Common({src: "assets/scene/images/lightmask1.png"})
    })  


    const big_model = engine.getEntityByName<EntityNames>(EntityNames.sohoscene_glb)

    // Change the color of the TRex
    GltfNodeModifiers.create(
        big_model,
        {
          modifiers: [{
            path: 'TRex',
            material: {
              material: {
                $case: 'pbr', pbr: {
                  albedoColor: Color4.Red(),
                }
              }
            }
          },{
            path: 'TRex.000000sgsdh1',
            material: {
              material: {
                $case: 'pbr', pbr: {
                  albedoColor: Color4.Magenta(),
                }
              }
            }
          }]
        }
      )
    

    // Add the oscillation system
    //engine.addSystem(oscillateSpotlights)
}
