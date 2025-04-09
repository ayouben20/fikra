// Custom JavaScript for Fikra Stitching

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

document.addEventListener('DOMContentLoaded', (event) => {
    // Add any initialization JavaScript here
    console.log('DOM fully loaded and parsed');

    // Smooth scrolling for anchor links
    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if(targetElement) {
                 // Calculate position considering the fixed navbar height (adjust 70 if navbar height/offset changes)
                 const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 70;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Optional: Update URL hash without jumping (if desired)
                // history.pushState(null, null, targetId);

                // Optional: Close mobile navbar after click
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarToggler && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click(); // Simulate click to close
                }
            }
        });
    });

    // Optional: Activate ScrollSpy manually if needed, though data attributes usually suffice
    // var scrollSpy = new bootstrap.ScrollSpy(document.body, {
    //     target: '#navbarNav',
    //     offset: 60 
    // })

    // --- Three.js 3D Model Viewer --- //
    const container = document.getElementById('model-viewer-container');
    const loadingIndicator = document.getElementById('loading-indicator');

    if (container) {
        let scene, camera, renderer, controls, model;

        function init3D() {
            // Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xe9ecef); // Match container background

            // Camera
            camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.set(0, 1.6, 3); // Adjust initial camera position (x, y, z)

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            // Controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true; // Smooth camera movement
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false;
            controls.minDistance = 1; // Zoom limits
            controls.maxDistance = 10;
            controls.target.set(0, 1, 0); // Point controls towards the model's center (adjust y based on model height)
            controls.update();

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Soft white light
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(5, 10, 7.5);
            scene.add(directionalLight);

            // Load Model
            const loader = new FBXLoader();
            loader.load(
                'model/girl_character.fbx', // Path to your model
                (object) => {
                    model = object;
                    // Scale model if needed
                    // model.scale.set(0.01, 0.01, 0.01);

                    // Center the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.sub(center); // Center the model's geometry at origin
                    model.position.y = 0; // Adjust vertical position if needed (e.g., place feet at y=0)

                    scene.add(model);

                    // Adjust camera target and potentially position based on loaded model size
                    const boundingBox = new THREE.Box3().setFromObject(model);
                    const modelHeight = boundingBox.max.y - boundingBox.min.y;
                    controls.target.set(0, modelHeight / 2, 0); // Aim camera at model center
                    // You might want to adjust camera.position.z based on model size too
                    camera.position.z = modelHeight * 1.5; // Example: Set distance based on height
                    controls.update();

                    // Hide loading indicator
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                    console.log('FBX model loaded successfully');
                },
                (xhr) => {
                    // Optional: Loading progress
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    console.log(percentComplete + '% loaded');
                    if (loadingIndicator) {
                         loadingIndicator.textContent = `Loading 3D Model: ${Math.round(percentComplete)}%`;
                    }
                },
                (error) => {
                    console.error('An error happened loading the FBX model:', error);
                    if (loadingIndicator) {
                        loadingIndicator.textContent = 'Error loading model.';
                        loadingIndicator.style.color = 'red';
                    }
                }
            );

            // Animation Loop
            animate();

            // Handle Window Resize
            window.addEventListener('resize', onWindowResize, false);
        }

        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // Only required if controls.enableDamping = true
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }

        // Initialize the 3D viewer
        init3D();

    } else {
        console.error('Model viewer container not found!');
    }
}); 