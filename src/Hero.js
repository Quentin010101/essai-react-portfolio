import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useEffect } from 'react';
import { gsap } from "gsap";

export const Hero = () => {
    const largeurGrille = 8
    const longueurGrille = 13
    const gap = -0.2

    useEffect(() => {
        let width = window.innerWidth
        let height = window.innerHeight

        const meshes = []
        const gutter = { size: 0.44 }

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
            105,
            width / height,
            1,
            1000
        )
        camera.position.z = 10

        const canvas = document.getElementById('canvas')
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        })
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.setSize(width, height)
        const controls = new OrbitControls(camera, renderer.domElement)
        document.body.appendChild(renderer.domElement)

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
        scene.add(ambientLight)

        const spotLight = new THREE.PointLight(0xffffff, 1)
        spotLight.position.set(0, 0, 100)
        spotLight.castShadow = true
        spotLight.shadow.mapSize.width = 1512
        spotLight.shadow.mapSize.height = 1512
        spotLight.shadow.camera.near = 2.5
        spotLight.shadow.camera.far = 200
        spotLight.shadow.camera.top = -15
        spotLight.shadow.camera.bottom = 15
        spotLight.shadow.camera.right = 15
        spotLight.shadow.camera.left = 15
        const spotLight2 = new THREE.PointLight(0xffffff, 1)
        spotLight2.position.set(20, 10, 120)
        spotLight2.castShadow = true
        spotLight2.shadow.mapSize.width = 1512
        spotLight2.shadow.mapSize.height = 1512
        spotLight2.shadow.camera.near = 1.5
        spotLight2.shadow.camera.far = 300
        spotLight2.shadow.camera.top = 15
        spotLight2.shadow.camera.bottom = 15
        spotLight2.shadow.camera.right = -15
        spotLight2.shadow.camera.left = 15
        scene.add(spotLight2)

        const BoxGeometry = new THREE.BoxGeometry(gutter.size, gutter.size, gutter.size)
        const BoxMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true
        })

        // add Group
        const group = new THREE.Object3D()

        // add box
        for (let i = 0; i < longueurGrille; i++) {
            meshes[i] = []
            for (let j = 0; j < largeurGrille; j++) {

                const BoxMesh = new THREE.Mesh(BoxGeometry, BoxMaterial)
                BoxMesh.castShadow = true;
                BoxMesh.receiveShadow = true;
                BoxMesh.position.x = gap * i + (i * gutter.size)
                BoxMesh.position.y = gap * j + (j * gutter.size);
                BoxMesh.material.opacity = 1
                BoxMesh.material.metalness = 0.3
                BoxMesh.material.roughness = 0.5
                group.add(BoxMesh)
                meshes[i][j] = BoxMesh
            }
        }
        const centerX = -((longueurGrille * gutter.size + longueurGrille * gap) / 2);
        const centerY = -((largeurGrille * gutter.size + largeurGrille * gap) / 2);
        group.position.set(centerX, centerY, 0)
        scene.add(group)

        // add plane
        const PlaneGeometry = new THREE.PlaneGeometry(400, 400)
        const PlaneMaterial = new THREE.MeshStandardMaterial({
            color: 0x0000FF
        })

        const PlaneMesh = new THREE.Mesh(PlaneGeometry, PlaneMaterial)
        PlaneMesh.position.z = -50


        PlaneMesh.receiveShadow = true
        scene.add(PlaneMesh)

        const animate = () => {

            renderer.render(scene, camera)
            controls.update();
            window.requestAnimationFrame(animate)
        }
        animate()

        const pointer = new THREE.Vector2()
        const raycaster = new THREE.Raycaster()

        function pytagore(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2))
        }

        function onMouseMove(event) {
            pointer.x = (event.clientX / width) * 2 - 1;
            pointer.y = -(event.clientY / height) * 2 + 1;

            raycaster.setFromCamera(pointer, camera)
            const intersects = raycaster.intersectObjects([PlaneMesh])

            if (intersects.length) {
                for (let i = 0; i < longueurGrille; i++) {
                    const { x, y } = intersects[0].point

                    for (let j = 0; j < largeurGrille; j++) {
                        const mesh = meshes[i][j]

                        const mouseDistance = pytagore(x, y, mesh.position.x + group.position.x, mesh.position.y + group.position.y)
                        const elevation = (1 / mouseDistance) * 100
                        gsap.to(mesh.position, { z: elevation < 3 ? 0 : -elevation > 30 ? -30 : -elevation })

                        const radians = (degrees) => {
                            return degrees * Math.PI / 180;
                        }

                        const map = (value, start1, stop1, start2, stop2) => {
                            return (value - start1) / (stop1 - start1) * (stop2 - start2) + start2
                        }

                        const scale = mesh.position.z/10
                        const scalemax = scale < 1 ? 1 : scale 
                        gsap.to(mesh.scale, {
                            x: scalemax,
                            y: scalemax,
                            z: scalemax,
                
                        })
                        // gsap.to(mesh.rotation, {
                        //     x: map(mesh.position.z, -1, 0, radians(90), 0),
                        //     y: map(mesh.position.z, -1, 0, radians(-270), 0),
                        //     z: map(mesh.position.z, -1, 0, radians(45), 0),
                        //     ease: 'sine',
                        
                        // })

                        // position of the mouse compared to plane
                        // const coord = map(mouseDistance, 70, 0, 0, 6)
                        // gsap.to(mesh.position, { z: coord < 1 ? 0 : coord })
                    }
                }
            }
        }
        function onResize() {
            width = window.innerWidth
            height = window.innerHeight

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
        window.addEventListener('mousemove', (e) => {
            onMouseMove(e)
        })
        window.addEventListener('resize', (e) => {
            onResize(e)
        })



        return () => {
        };
    }, []);


    return (
        <div>
            <canvas id='canvas' ></canvas>
        </div>
    )
}