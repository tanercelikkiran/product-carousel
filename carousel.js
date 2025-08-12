(() => {
    const API_URL = 'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json';
    const TARGET_ELEMENT_SELECTOR = 'div[class^="ins-preview-wrapper"]';

    const init = async () => {
        try {
            const products = await fetchData();
            if (products && products.length > 0) {
                buildHTML(products);
                buildCSS();
                setEvents();
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    };

    const fetchData = async () => {
        try {
            const products = localStorage.getItem('customCarouselProducts');
            if (products) {
                return JSON.parse(products);
            }
            throw new Error('Not in localStorage');
        } catch (error) {
            console.error('Not found in localStorage, fetching from API');
            const response = await fetch(API_URL);
            const productsData = await response.json();
            localStorage.setItem('customCarouselProducts', JSON.stringify(productsData));
            return productsData;
        }
    };

    const getFavouriteIds = () => {
        const favouriteIds = localStorage.getItem('favouriteProductIds');
        return favouriteIds ? JSON.parse(favouriteIds) : [];
    };

    const toggleFavouriteStatus = (productId) => {
        if (!productId || productId === 'undefined' || productId === 'null') {
            console.error('Invalid product ID:', productId);
            return;
        }

        const productIdStr = String(productId);
        const favouriteIds = getFavouriteIds();
        const productIndex = favouriteIds.indexOf(productIdStr);

        if (productIndex > -1) {
            favouriteIds.splice(productIndex, 1);
        } else {
            favouriteIds.push(productIdStr);
        }

        localStorage.setItem('favouriteProductIds', JSON.stringify(favouriteIds));
    };

    const buildHTML = (products) => {
        const favouriteIds = getFavouriteIds();

        const productSlides = products.map(product => {
            const productId = product.id ? String(product.id) : null;
            if (!productId) {
                console.error('Product missing ID:', product);
                return '';
            }

            const hasDiscount = product.price < product.original_price;
            let priceHTML = '';
            if (hasDiscount) {
                const discountPercentage = Math.round(((product.original_price - product.price) / product.original_price) * 100);
                priceHTML = `
                    <div class="price-container discounted">
                        <span class="original-price">${product.original_price.toFixed(2).replace('.', ',')} TL</span>
                        <span class="discount-badge">
                            %${discountPercentage}
                            <i class="icon-discount">&darr;</i>
                        </span>
                        <span class="current-price">${product.price.toFixed(2).replace('.', ',')} TL</span>
                    </div>
                `;
            } else {
                priceHTML = `
                    <div class="price-container">
                        <span class="current-price">${product.price.toFixed(2).replace('.', ',')} TL</span>
                    </div>
                `;
            }

            const isFavourited = favouriteIds.includes(productId);

            return `
            <div class="custom-carousel-slide">
                <div class="product-card">
                    <button class="favourite-btn ${isFavourited ? 'favourited' : ''}" data-product-id="${productId}">
                        ${isFavourited ? '♥' : '♡'}
                    </button>
                    <a href="${product.url}" target="_blank" class="product-link">
                        <div class="slide-image-container">
                            <img src="${product.img}" alt="${product.name.trim()}" />
                        </div>
                        <div class="slide-info-container">
                            <div class="slide-product-info">
                                <b>${product.brand} -</b> 
                                <span>${product.name.trim()}</span>
                            </div>
                            ${priceHTML}
                        </div>
                    </a>
                    <button class="add-to-cart-btn">Sepete Ekle</button>
                </div>
            </div>
        `;
        }).filter(slide => slide !== '').join('');

        const carouselHTML = `
            <div id="custom-carousel-container">
                <div id="custom-carousel-header">
                    <h2>Sizin için Seçtiklerimiz</h2>
                </div>
                <div class="custom-carousel-outer">
                    <div class="custom-carousel-wrapper">
                        ${productSlides}
                    </div>
                </div>
                <button class="custom-carousel-btn prev">&lt;</button>
                <button class="custom-carousel-btn next">&gt;</button>
            </div>
        `;

        const targetElement = document.querySelector(TARGET_ELEMENT_SELECTOR);
        if (targetElement) {
            targetElement.insertAdjacentHTML('afterend', carouselHTML);
        }
    };

    const buildCSS = () => {
        const css = `
            #custom-carousel-container {
                font-size: 1rem;
                line-height: 1.6;
                color: #212738;
                font-family: Quicksand-Medium;
                text-align: start;
                box-sizing: border-box;
                width: 100%;
                padding-right: 15px;
                padding-left: 15px;
                margin-right: auto;
                margin-left: auto;
                min-width: 0!important;
                max-width: 1320px;
                position: relative;
            }
            #custom-carousel-container h2 {
                text-align: center;
                margin-bottom: 25px;
                color: #4a4a4a;
                font-size: 28px;
                font-weight: 600;
            }
            #custom-carousel-header {
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background-color: #fef6eb;
                padding: 25px 67px;
                border-top-left-radius: 35px;
                border-top-right-radius: 35px;
            }
            #custom-carousel-header h2 {
                box-sizing: border-box;
                font-family: Quicksand-Bold;
                font-size: 3rem;
                font-weight: 700;
                line-height: 1.11;
                color: #f28e00;
                margin: 0;
            }
            .custom-carousel-btn {
                background-color: #fff7ec;
                color: #f28e00;
                border: 1px solid transparent;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                z-index: 10;
            }
            .custom-carousel-btn.prev { left: -30px; }
            .custom-carousel-btn.next { right: -30px; }
            .custom-carousel-btn:hover {
                background-color: white;
                border-color: #ff8900;
            }
            .custom-carousel-outer {
                overflow: hidden;
            }
            .custom-carousel-wrapper { display: flex; transition: transform 0.5s ease-in-out; }
            .custom-carousel-slide {
                flex: 0 0 20%;
                box-sizing: border-box;
                padding: 10px;
                display: flex;
                align-items: stretch;
                font-size: 1rem;
                line-height: 1.6;
                font-family: Quicksand-Medium;
                text-align: start;
            }
            .product-card-link {
                display: flex;
                flex-direction: column;
                flex: 1 1 auto;
                min-width: 0;
            }
            .product-card {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-sizing: border-box;
                z-index: 1;
                width: 100%;
                font-family: Poppins,"cursive";
                font-size: 12px;
                padding: 10px;
                color: #7d7d7d;
                margin: 0 0 20px 3px;
                border: 3px solid transparent;
                border-radius: 10px;
                position: relative;
                text-decoration: none;
                background-color: #fff;
                margin-top: 20px;
                height: auto;
                min-height: 500px;
                align-self: stretch;
                overflow: hidden;
            }
            .product-card:hover {
                border-color: #ff8900; 
            }
            .product-link {
                text-decoration: none;
                color: inherit;
                display: flex;
                flex-direction: column;
                flex: 1 1 auto;
                min-height: 0;
            }
            .slide-image-container { padding: 15px; }
            .slide-image-container img {
                max-width: 100%;
                height: auto;
                aspect-ratio: 1/1;
                object-fit: contain;
                display: block;
            }
            .slide-info-container { 
                padding: 0 15px 15px; 
                text-align: left; 
                min-height: 0; 
            }
            .slide-product-info {
                font-family: Poppins,"cursive";
                box-sizing: border-box;
                margin-top: 0;
                user-select: none;
                font-weight: 500;
                line-height: 1.2222222222;
                font-size: 1.2rem;
                height: 42px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            .price-container {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 8px;
                margin-bottom: 15px;
            }
            .price-container .current-price {
                line-height: 1.6;
                text-align: start;
                user-select: none;
                font-family: Poppins,"cursive";
                box-sizing: border-box;
                display: block;
                width: 100%;
                font-size: 2.2rem;
                font-weight: 600;
            }
            .price-container.discounted .current-price { color: #00a365; }
            .price-container .original-price {
                line-height: 1.6;
                text-align: start;
                user-select: none;
                font-family: Poppins,"cursive";
                box-sizing: border-box;
                font-size: 1.4rem;
                font-weight: 500;
                text-decoration: line-through;
            }
            .price-container .discount-badge {
                line-height: 1.6;
                text-align: start;
                user-select: none;
                font-family: Poppins,"cursive";
                box-sizing: border-box;
                margin-left: .2rem!important;
                color: #00a365;
                font-size: 18px;
                font-weight: 700;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .price-container .discount-badge i {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 22px;
                height: 22px;
                font-size: 13px;
                margin-left: 5px;
                border-radius: 50%;
                background-color: #00a365;
                color: white;
                font-style: italic;
                line-height: 1;
            }
            .add-to-cart-btn {
                box-sizing: border-box;
                margin: 0;
                overflow: visible;
                display: inline-block;
                text-align: center;
                vertical-align: middle;
                user-select: none;
                border: 1px solid transparent;
                transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
                text-transform: var(--cx-text-transform);
                line-height: 1.34;
                height: 48px;
                max-height: 48px;
                min-width: 48px;
                cursor: pointer;
                width: 100%;
                padding: 15px 20px;
                border-radius: 37.5px;
                background-color: #fff7ec;
                color: #f28e00;
                font-family: Poppins,"cursive";
                font-size: 1.4rem;
                font-weight: 700;
                position: relative;
                z-index: 2;
                margin-top: auto;
            }
            .add-to-cart-btn:hover { background-color: #ff8900; color: #fff; }
            .product-card a,
            .product-card a:hover,
            .product-card a:focus,
            .product-card a:active {
                color: #7d7d7d !important;
            }

            .favourite-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                z-index: 3; /* Ensures it's above other card content */
                background: none;
                border: none;
                cursor: pointer;
                font-size: 28px;
                color: #cccccc; 
                padding: 0;
                line-height: 1;
                transition: color 0.2s ease-in-out;
            }
            .favourite-btn:hover {
                color: #f28e00;
                border-color: #f28e00;
            }
            .favourite-btn.favourited {
                color: #f28e00; 
            }
        `;

        const existingStyle = document.querySelector('.custom-carousel-style');
        if (existingStyle) existingStyle.remove();
        const styleElement = document.createElement('style');
        styleElement.classList.add('custom-carousel-style');
        styleElement.innerHTML = css;
        document.head.appendChild(styleElement);
    };

    const setEvents = () => {
        const carouselContainer = document.querySelector("#custom-carousel-container");
        if (!carouselContainer) return;

        const wrapper = carouselContainer.querySelector('.custom-carousel-wrapper');
        const slides = carouselContainer.querySelectorAll('.custom-carousel-slide');
        if (!slides.length || !wrapper) return;

        const nextBtn = carouselContainer.querySelector('.custom-carousel-btn.next');
        const prevBtn = carouselContainer.querySelector('.custom-carousel-btn.prev');
        if (!nextBtn || !prevBtn) return;

        let currentIndex = 0;
        const totalSlides = slides.length;
        const slidesPerPage = 5;
        const firstSlide = slides[0];

        nextBtn.addEventListener('click', () => {
            if (currentIndex < (totalSlides - slidesPerPage)) {
                currentIndex++;
                const slideWidth = firstSlide.offsetWidth;
                wrapper.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                const slideWidth = firstSlide.offsetWidth;
                wrapper.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            }
        });

        wrapper.addEventListener('click', (event) => {
            const favouriteButton = event.target.closest('.favourite-btn');
            if (favouriteButton) {
                event.preventDefault();
                event.stopPropagation();

                const productId = favouriteButton.getAttribute('data-product-id');
                if (!productId || productId === 'undefined' || productId === 'null') {
                    console.error('Invalid product ID from button:', productId);
                    return;
                }

                toggleFavouriteStatus(productId);

                favouriteButton.classList.toggle('favourited');
                if (favouriteButton.classList.contains('favourited')) {
                    favouriteButton.innerHTML = '♥';
                } else {
                    favouriteButton.innerHTML = '♡';
                }
            }
        });
    };

    init();

})();