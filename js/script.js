// Custom JavaScript for Fikra Stitching

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// --- Preloader Hiding --- //
let preloaderHidden = false;
const preloader = document.getElementById('preloader');

function hidePreloader() {
    if (!preloaderHidden && preloader) {
        preloader.classList.add('hidden');
        preloaderHidden = true;
    }
}

window.addEventListener('load', hidePreloader);

// Failsafe: Hide preloader after a few seconds anyway
setTimeout(hidePreloader, 6000); // Hide after 6 seconds max

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // --- Navbar Scroll Effect --- //
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // Add class after scrolling 50px
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }

    // --- Initialize Bootstrap Tooltips --- //
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // --- Smooth Scrolling (Keep existing code, ensure offset matches CSS) --- //
    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if(targetElement) {
                 const offset = document.querySelector('.navbar').offsetHeight || 70; // Get actual navbar height or fallback
                 const elementPosition = targetElement.getBoundingClientRect().top;
                 const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarToggler && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });

    // --- Scroll to Top Button Logic --- //
    const scrollTopBtn = document.getElementById('scrollToTopBtn');

    if (scrollTopBtn) {
        // Show/Hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show after scrolling 300px
                scrollTopBtn.style.display = 'block';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });

        // Smooth scroll to top on click
        scrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Fade-in Animation on Scroll --- //
    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // trigger when 10% of the element is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Optional: Stop observing once visible
            } // No need for an else clause if we only add the class
        });
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        intersectionObserver.observe(section);
    });

    // --- Three.js 3D Model Viewer --- //
    const container = document.getElementById('model-viewer-container');
    const loadingIndicator = document.getElementById('loading-indicator');

    if (container) {
        let scene, camera, renderer, controls, model;

        function init3D() {
            // Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xF8F9FA); // Match light-bg variable

            // Camera
            camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.set(0.5, 1.6, 3.5); // Adjust initial camera position slightly out and to the side

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Use alpha for potentially transparent bg
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true; // Enable shadows
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);

            // Controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false; // Panning in screen space can feel weird for models
            controls.minDistance = 1.5; // Prevent zooming too close
            controls.maxDistance = 15;
            controls.target.set(0, 1, 0); // Initial target, will be adjusted after load
            controls.maxPolarAngle = Math.PI / 1.9; // Prevent looking from below model
            controls.minPolarAngle = Math.PI / 4; // Prevent looking directly from top
            controls.enablePan = false; // Disable panning for simpler mobile interaction
            controls.update();

            // Lighting
            scene.add(new THREE.AmbientLight(0xffffff, 1.0)); // Increased ambient light

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(8, 15, 10);
            directionalLight.castShadow = true;
            // Shadow properties
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 50;
            scene.add(directionalLight);

            // Optional: Add a subtle hemisphere light for softer fill
            const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.6 );
            hemiLight.position.set( 0, 20, 0 );
            scene.add( hemiLight );

             // Optional: Ground plane for shadows
            // const groundGeo = new THREE.PlaneGeometry( 10, 10 );
            // const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 }); // Material that only receives shadows
            // const ground = new THREE.Mesh( groundGeo, groundMat );
            // ground.rotation.x = - Math.PI / 2;
            // ground.receiveShadow = true;
            // scene.add( ground );

            // Load Model
            const loader = new FBXLoader();
            loader.load(
                'model/girl_character.fbx',
                (object) => {
                    model = object;

                    let modelHeight = 0;
                    model.traverse((child) => { // Ensure shadows are cast and received
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            // Optional: Adjust material properties if needed
                            // child.material.metalness = 0.1;
                            // child.material.roughness = 0.5;
                        }
                    });

                    // Scale and Center model
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    modelHeight = size.y;
                    const center = box.getCenter(new THREE.Vector3());

                    // Simple scaling: Adjust model so its height is roughly 2 units
                    const scaleFactor = 2.0 / modelHeight;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    // Recalculate bounds after scaling
                    const scaledBox = new THREE.Box3().setFromObject(model);
                    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

                    // Reposition model so its bottom is near y=0
                    model.position.x = -scaledCenter.x;
                    model.position.y = -scaledBox.min.y; // Align bottom of bounding box to y=0
                    model.position.z = -scaledCenter.z;

                    scene.add(model);

                    // Adjust camera target and position based on loaded model size
                    controls.target.set(0, modelHeight * scaleFactor / 2, 0); // Aim camera at scaled model center y
                    camera.position.z = modelHeight * scaleFactor * 1.8; // Adjust distance based on scaled height
                    controls.update();

                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                    console.log('FBX model loaded successfully');
                },
                (xhr) => {
                    const percentComplete = xhr.total > 0 ? (xhr.loaded / xhr.total) * 100 : 0;
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
            controls.update();
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            if (!container) return; // Ensure container exists
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }

        init3D();

    } else {
        console.error('Model viewer container not found!');
    }

}); 