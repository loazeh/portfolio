document.addEventListener('DOMContentLoaded', () => {

    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

            }

        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    const profilePic = document.getElementById('profile-pic');
    if (profilePic) {
        setTimeout(() => {
           profilePic.style.transform = 'scale(1.05)';
           setTimeout(() => profilePic.style.transform = 'scale(1)', 500);
        }, 300);
    }


    const container = document.getElementById('canvas-container');
    if (!container || typeof THREE === 'undefined') {
        console.error("Three.js container not found or THREE library not loaded.");
        return;
    }


    let scene, camera, renderer, stars, particles;
    let mouseX = 0, mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    function initThreeJS() {

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x1c1c1e, 0.001);


        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.z = 500;


        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);


        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 8000; i++) {
             const x = Math.random() * 2000 - 1000;
             const y = Math.random() * 2000 - 1000;
             const z = Math.random() * 1500 - 500;
             starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({
            color: 0x555555,
            size: 1.5,
            sizeAttenuation: true
        });
        stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);



         const particleGeometry = new THREE.BufferGeometry();
         const particleVertices = [];
         const particleCount = 100;
         for (let i = 0; i < particleCount; i++) {
             const x = Math.random() * 800 - 400;
             const y = Math.random() * 800 - 400;
             const z = Math.random() * 400 - 200;
             particleVertices.push(x, y, z);
         }
         particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particleVertices, 3));
         const particleMaterial = new THREE.PointsMaterial({
             color: 0xFFFFFF,
             size: 8,
             map: createParticleTexture(),
             blending: THREE.AdditiveBlending,
             depthTest: false,
             transparent: true,
             opacity: 0.6
         });
         particles = new THREE.Points(particleGeometry, particleMaterial);
         scene.add(particles);



        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        window.addEventListener('scroll', onScrollUpdate, false);
    }

    function createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const context = canvas.getContext('2d');
        context.beginPath();
        context.arc(8, 8, 7, 0, 2 * Math.PI, false);
        context.fillStyle = 'rgba(255,255,255,1)';
        context.fill();
        return new THREE.CanvasTexture(canvas);
    }


    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    }

    function onDocumentMouseMove(event) {

         mouseX = (event.clientX - windowHalfX) / windowHalfX;
         mouseY = (event.clientY - windowHalfY) / windowHalfY;
    }

    function onScrollUpdate() {

        const scrollY = window.scrollY;

        camera.position.y = -scrollY * 0.1;

        if(particles) {
             particles.rotation.x = scrollY * 0.0002;
             particles.rotation.y = scrollY * 0.0001;
        }
    }


    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        const time = Date.now() * 0.00005;


        camera.position.x += (mouseX * 100 - camera.position.x) * 0.015;




        camera.lookAt(scene.position);


        stars.rotation.x += 0.0001;
        stars.rotation.y += 0.00015;


         if(particles) {
             particles.rotation.z += 0.0005;
             const particlePositions = particles.geometry.attributes.position.array;
             for (let i = 0; i < particlePositions.length; i += 3) {

                particlePositions[i + 1] += Math.sin(time * 100 + i) * 0.1;
             }
            particles.geometry.attributes.position.needsUpdate = true;
         }

        renderer.render(scene, camera);
    }

    if (typeof THREE !== 'undefined' && container) {
        initThreeJS();
        animate();
    }

});