import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { GLTF } from 'three-stdlib' 

type GLTFResult = GLTF & {
  nodes: {
    ID3: THREE.Mesh
    ID11: THREE.Mesh
    ID11_node: THREE.Mesh
    ID19: THREE.Mesh
    ID26: THREE.Mesh
    ID33: THREE.Mesh
    ID33_node: THREE.Mesh
    ID40: THREE.Mesh
    ID47: THREE.Mesh
    ID54: THREE.Mesh
    ID61: THREE.Mesh
    ID68: THREE.Mesh
    ID76: THREE.Mesh
    ID76_1: THREE.Mesh
    ID85: THREE.Mesh
    ID85_1: THREE.Mesh
    ID91: THREE.Mesh
  }
  materials: {
    ID10: THREE.MeshStandardMaterial
    ID18: THREE.MeshStandardMaterial
    ID82: THREE.MeshStandardMaterial
    ID83: THREE.MeshStandardMaterial
  }
  animations: THREE.AnimationClip[]
}

export function Model(props: any) {
  const { nodes, materials } = useGLTF('/putmc.glb') as unknown as GLTFResult
  
  // Create reference for the ID19 Fan
  const fanRef = useRef<THREE.Mesh>(null)

  // --- NEW: Custom Glowing Material for the UV Light ---
  const uvGlowMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#7f54f8').multiplyScalar(10), // Multiply pushes it over the Bloom threshold
    toneMapped: false // Crucial: stops the browser from washing out the bright color
  }), []);

  // Spin the fan
  useFrame((_, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.z += delta * 15
    }
  })

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group position={[0.001, -0.097, 0.327]} rotation={[-0.084, 0, 0]}>
          <mesh geometry={nodes.ID76.geometry} material={materials.ID82} />
          <mesh geometry={nodes.ID76_1.geometry} material={materials.ID83} />
        </group>
        <group position={[0, -0.097, 0.319]} rotation={[-0.084, 0, 0]}>
          <mesh geometry={nodes.ID85.geometry} material={materials.ID10} />
          <mesh geometry={nodes.ID85_1.geometry} material={materials.ID18} />
        </group>
        <group position={[0.001, -0.231, 0.339]} rotation={[-0.084, 0, 0]}>
          <mesh geometry={nodes.ID76.geometry} material={materials.ID82} />
          <mesh geometry={nodes.ID76_1.geometry} material={materials.ID83} />
        </group>
        
        <mesh geometry={nodes.ID3.geometry} material={materials.ID10} position={[0, -0.145, 0.232]} />
        <mesh geometry={nodes.ID11.geometry} material={materials.ID18} position={[0, -0.144, 0.215]} />
        <mesh geometry={nodes.ID11_node.geometry} material={materials.ID18} position={[0, -0.144, 0.215]} />
        
        {/* The Fan Mesh (ID19) */}
        <mesh 
          ref={fanRef} 
          geometry={nodes.ID19.geometry} 
          material={materials.ID10} 
          position={[0, -0.145, 0.215]} 
        />
        
        {/* --- APPLIED: The UV Glow Material is now on ID26 --- */}
        <mesh geometry={nodes.ID26.geometry} material={uvGlowMaterial} position={[0, -0.138, 0.311]} rotation={[-0.084, 0, 0]} />
        
        <mesh geometry={nodes.ID33.geometry} material={materials.ID10} position={[0, 0.008, 0.255]} />
        <mesh geometry={nodes.ID33_node.geometry} material={materials.ID10} position={[0.143, 0.008, 0.255]} />
        
        {/* ID40 restored to default material */}
        <mesh geometry={nodes.ID40.geometry} material={materials.ID10} position={[0, 0.067, 0.055]} />
        
        <mesh geometry={nodes.ID47.geometry} material={materials.ID10} position={[0, 0.008, 0.25]} />
        <mesh geometry={nodes.ID54.geometry} material={materials.ID10} position={[0, -0.145, 0.245]} />
        <mesh geometry={nodes.ID61.geometry} material={materials.ID10} position={[0, -0.145, 0.215]} />
        <mesh geometry={nodes.ID68.geometry} material={materials.ID10} position={[0, -0.019, 0.25]} />
        <mesh geometry={nodes.ID91.geometry} material={materials.ID10} position={[0, -0.019, 0.25]} />
      </group>
    </group>
  )
}

useGLTF.preload('/putmc.glb')