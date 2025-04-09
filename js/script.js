// Custom JavaScript for Fikra Stitching

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
                 // Calculate position considering the fixed navbar height (adjust 60 if navbar height/offset changes)
                 const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 60;

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
}); 