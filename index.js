
        // Create animated stars
        function createStars() {
            const starsContainer = document.querySelector('.stars');
            const starCount = 100;
            
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                starsContainer.appendChild(star);
            }
        }

        // Create floating elements
        function createFloatingElements() {
            const container = document.querySelector('.floating-elements');
            const elementCount = 5;
            
            for (let i = 0; i < elementCount; i++) {
                const circle = document.createElement('div');
                circle.className = 'floating-circle';
                const size = Math.random() * 100 + 50;
                circle.style.width = size + 'px';
                circle.style.height = size + 'px';
                circle.style.left = Math.random() * 100 + '%';
                circle.style.top = Math.random() * 100 + '%';
                circle.style.animationDelay = Math.random() * 6 + 's';
                circle.style.animationDuration = (Math.random() * 4 + 4) + 's';
                container.appendChild(circle);
            }
        }

        // Stacked card carousel functionality
        let currentIndex = 0;
        const cards = document.querySelectorAll('.project-card');
        const dots = document.querySelectorAll('.stack-dot');
        const totalCards = cards.length;
        const projectsTrack = document.getElementById('projectsTrack');
        const overlayLeft = document.querySelector('.projects-track-overlay-left');
        const overlayRight = document.querySelector('.projects-track-overlay-right');


        function updateCardPositions() {
            cards.forEach((card, index) => {
                card.classList.remove('active', 'next', 'prev', 'hidden');
                
                if (index === currentIndex) {
                    card.classList.add('active');
                } else if (index === (currentIndex + 1) % totalCards) {
                    card.classList.add('next');
                } else if (index === (currentIndex - 1 + totalCards) % totalCards) {
                    card.classList.add('prev');
                } else {
                    card.classList.add('hidden');
                }
            });
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCardPositions();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCardPositions();
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCardPositions();
        }

        // Initialize carousel
        function initCarousel() {
            // Click listeners for the new overlay divs
            overlayLeft.addEventListener('click', prevSlide);
            overlayRight.addEventListener('click', nextSlide);
            
            // Keyboard navigation (optional, but good for accessibility)
            document.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowLeft') {
                    prevSlide();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                }
            });
            
            // Dot navigation
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => goToSlide(index));
            });
            
            // Touch/swipe support for mobile (Still on projectsTrack for swiping the cards themselves)
            let startX = 0;
            let endX = 0;
            
            projectsTrack.addEventListener('touchstart', (e) => {
                // Allow clicking project link within the active card without triggering swipe
                if (e.target.closest('.project-link')) {
                    return;
                }
                startX = e.touches[0].clientX;
            });
            
            projectsTrack.addEventListener('touchend', (e) => {
                // Allow clicking project link within the active card without triggering swipe
                if (e.target.closest('.project-link')) {
                    return;
                }
                endX = e.changedTouches[0].clientX;
                handleSwipe();
            });
            
            function handleSwipe() {
                const threshold = 50;
                const diff = startX - endX;
                
                if (Math.abs(diff) > threshold) {
                    if (diff > 0) {
                        nextSlide(); // Swipe left - next
                    } else {
                        prevSlide(); // Swipe right - prev
                    }
                }
            }
            
            updateCardPositions();
        }

        // Initialize animations
        document.addEventListener('DOMContentLoaded', function() {
            createStars();
            createFloatingElements();
            initCarousel();
        });

        // Add parallax effect to background elements
        let throttleTimer;
        window.addEventListener('mousemove', function(e) {
            if (throttleTimer) return; // If a timer is already set, exit

            throttleTimer = setTimeout(() => {
                const mouseX = e.clientX / window.innerWidth;
                const mouseY = e.clientY / window.innerHeight;
                
                const floatingElements = document.querySelectorAll('.floating-circle');
                floatingElements.forEach((element, index) => {
                    const speed = (index + 1) * 0.02;
                    const x = mouseX * speed * 50;
                    const y = mouseY * speed * 50;
                    element.style.transform = `translate(${x}px, ${y}px)`;
                });
                throttleTimer = null; // Clear the timer after execution
            }, 50); // Run at most every 50ms
        });