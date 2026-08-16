document.addEventListener("DOMContentLoaded", function () {

    /* =================================
        REVIEW SLIDER
    ================================= */

    const track = document.querySelector(".reviews-track");
    const dotsContainer = document.querySelector(".review-dots");

    if (!track || !dotsContainer) {
        return;
    }

    let current = 0;
    let autoSlide = null;


    /* =================================
        LOAD SAVED REVIEWS
    ================================= */

    let savedReviews = [];

    try {
        savedReviews =
            JSON.parse(localStorage.getItem("beautyReviews")) || [];
    } catch (error) {
        savedReviews = [];
    }


    /* =================================
        GIVE OLD REVIEWS UNIQUE ID
    ================================= */

    let dataChanged = false;

    savedReviews = savedReviews.map(function (review) {

        if (!review.id) {

            dataChanged = true;

            return {
                ...review,
                id:
                    "review_" +
                    Date.now() +
                    "_" +
                    Math.random().toString(36).substring(2)
            };
        }

        return review;
    });


    if (dataChanged) {

        localStorage.setItem(
            "beautyReviews",
            JSON.stringify(savedReviews)
        );

    }


    /* =================================
        SECURITY
    ================================= */

    function escapeHTML(value) {

        const div = document.createElement("div");

        div.textContent = String(value ?? "");

        return div.innerHTML;
    }


    /* =================================
        CREATE CUSTOMER REVIEW CARD
    ================================= */

    function createReviewCard(review) {

        const card = document.createElement("div");

        card.className =
            "review-card customer-review-card";

        const rating = Math.max(
            1,
            Math.min(5, Number(review.rating) || 5)
        );

        const stars =
            "★".repeat(rating) +
            "☆".repeat(5 - rating);

        card.dataset.reviewId = review.id;


        card.innerHTML = `

            <div class="review-stars">
                ${stars}
            </div>


            <p>
                "${escapeHTML(review.message)}"
            </p>


            <div class="client">

                <div class="client-avatar">
                    ${escapeHTML(
                        String(review.name || "C")
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>


                <div>

                    <h4>
                        ${escapeHTML(review.name)}
                    </h4>


                    <span>
                        ${escapeHTML(review.service)}
                    </span>

                </div>

            </div>


            <button
                type="button"
                class="delete-review"
                data-review-id="${escapeHTML(review.id)}"
            >
                Delete My Review
            </button>

        `;

        return card;
    }


    /* =================================
        GET ALL REVIEW CARDS
    ================================= */

    function getCards() {

        return track.querySelectorAll(
            ".review-card"
        );

    }


    /* =================================
        LOAD SAVED CUSTOMER REVIEWS
    ================================= */

    savedReviews.forEach(function (review) {

        track.appendChild(
            createReviewCard(review)
        );

    });


    /* =================================
        CREATE DOTS & SLIDER CONTROLS
    ================================= */

    function updateSlider(index) {
        const cards = getCards();
        if (cards.length === 0) return;

        if (index < 0) {
            current = cards.length - 1;
        } else if (index >= cards.length) {
            current = 0;
        } else {
            current = index;
        }

        track.style.transform = `translateX(-${current * 100}%)`;

        const dots = dotsContainer.querySelectorAll(".review-dot");
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === current);
        });
    }

    function createDots() {
        dotsContainer.innerHTML = "";

        const cards = getCards();

        cards.forEach(function (_, index) {

            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "review-dot";
            if (index === 0) dot.classList.add("active");

            dot.addEventListener("click", function () {
                updateSlider(index);
                resetAutoSlide();
            });

            dotsContainer.appendChild(dot);
        });
    }

    function startAutoSlide() {
        autoSlide = setInterval(function () {
            updateSlider(current + 1);
        }, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlide);
        startAutoSlide();
    }

    /* =================================
        DELETE REVIEW FUNCTIONALITY
    ================================= */

    track.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-review")) {
            const reviewId = e.target.dataset.reviewId;

            // Remove from localStorage
            let currentReviews = JSON.parse(localStorage.getItem("beautyReviews")) || [];
            currentReviews = currentReviews.filter(r => r.id !== reviewId);
            localStorage.setItem("beautyReviews", JSON.stringify(currentReviews));

            // Remove card from DOM
            const cardToRemove = track.querySelector(`[data-review-id="${reviewId}"]`);
            if (cardToRemove) {
                cardToRemove.remove();
            }

            // Refresh dots and slider position
            createDots();
            updateSlider(0);
        }
    });

    // Initialize slider features
    createDots();
    startAutoSlide();
});