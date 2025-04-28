document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll('.fade-in');

    function checkVisibility() {
        const triggerHeight = window.innerHeight * 0.8;

        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            if (cardTop < triggerHeight) {
                card.classList.add('visible');
            }
        });
    }

    window.addEventListener("scroll", checkVisibility);
    checkVisibility();
});
