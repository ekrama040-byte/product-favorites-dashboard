// const state = {
//   products: [],
//   favorites: [],
//   search: ""
// };

// const searchform = document.querySelector("#search-form");
// const searchinput = document.querySelector("#search-input");
// const message = document.querySelector("#message");
// const productsContainer = document.querySelector("#products-container");
// const favoritesContainer = document.querySelector("#favorites-container");


// async function loadproducts(query) {
//   message.innerHTML = "Loading...";
  
//   try {
//     const response = await fetch(`https://dummyjson.com/products/search?q=${query}`);
    
//     if (!response.ok) {
//         throw new Error("Failed to fetch from API");
//     }
//     const data = await response.json();
//     if (!data.products || data.products.length === 0) {
//       message.innerHTML = "No products found.";
//       state.products = [];
//       render(); 
//       return;
//     }
    
//     state.products = data.products;
//     message.innerHTML = "";
//     render();
//   } 
//   catch (err) {
//     message.innerHTML = "Can't fetch from the API.";
//     console.error("The real error is:", err); 
//   }
// } 


// function render() {
//   const term = state.search.toLowerCase().trim();
//   const filtered = state.products.filter((product) =>
//     product.title.toLowerCase().includes(term)
//   );

//   productsContainer.innerHTML = filtered.map((product) => createCard(product)).join("");
//   favoritesContainer.innerHTML = state.favorites.map((fav) => createCard(fav)).join("");
// }

// function createCard(product) {
//   const image = product?.thumbnail; 
//   const name = product?.title;     
//   const rating = product?.rating;  
//   const saved = state.favorites.some((fav) => fav.id === product.id);
  
//   return `
//     <div class="product-card">
    
//       <img src="${image}" alt="${name}">
//       <div class="product-info-row">
//         <div class="product-text">
//           <span class="product-name">${name}</span>
//           <span class="product-rating">Rating: ${rating || "N/A"}</span>
//         </div>
//          <button 
//             class="${saved ? "remove-btn" : "favorite-btn"}"
//             onclick="toggleFavorite(${product.id})"
//         >
//          ${saved ? "Remove" : "Favorite"}
//         </button>
//       </div>
//     </div>
//   `;
// }


// function toggleFavorite(id) {
//   const exist = state.favorites.some((fav) => fav.id === id);

//   if (exist) {
//     state.favorites = state.favorites.filter((data) => data.id !== id);
//   } else {
//     // FIX 3: Changed state.characters to state.products
//     const data = state.products.find((item) => item.id === id);
//     if (data) {
//       state.favorites.push(data);
//     }
//   }

//   saveFavorites();
//   render();
// }

// function saveFavorites() {
//   localStorage.setItem("favorites", JSON.stringify(state.favorites));
// }

// function loadFavorites() {
//   const savedData = localStorage.getItem("favorites");
//   state.favorites = JSON.parse(savedData) || [];
// }

// searchform.addEventListener("submit", (e) => {
//   e.preventDefault();
  
//   const query = searchinput.value.trim();
//   if (!query) {
//     return;
//   }

//   state.search = query;
//   loadproducts(query);
// });

// async function init() {
//   loadFavorites();
//   loadproducts("phone"); 
// }

// init();

/* =========================================================
   PRODUCT EXPLORER
   DummyJSON API
   Favorites
   Search
   Sorting
   LocalStorage
   Responsive UI
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
    "https://dummyjson.com/products/search";

const DEFAULT_QUERY =
    "phone";

const STORAGE_KEY =
    "product-explorer-favorites-v1";

const MAX_MAIN_RESULTS =
    12;

const MAX_SIDEBAR_FAVORITES =
    5;


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    products: [],

    favorites: loadFavorites(),

    query: DEFAULT_QUERY,

    requestId: 0

};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const els = {

    homeView:
        document.getElementById("homeView"),

    favoritesView:
        document.getElementById("favoritesView"),

    breadcrumbCurrent:
        document.getElementById("breadcrumbCurrent"),


    searchForm:
        document.getElementById("searchForm"),

    searchInput:
        document.getElementById("searchInput"),

    searchButton:
        document.getElementById("searchButton"),


    sortSelect:
        document.getElementById("sortSelect"),


    cardGrid:
        document.getElementById("cardGrid"),

    itemsCount:
        document.getElementById("itemsCount"),


    loadingState:
        document.getElementById("loadingState"),

    errorState:
        document.getElementById("errorState"),

    errorMessage:
        document.getElementById("errorMessage"),

    retryButton:
        document.getElementById("retryButton"),

    emptySearchState:
        document.getElementById("emptySearchState"),


    favoritesSidebarList:
        document.getElementById(
            "favoritesSidebarList"
        ),

    sidebarEmpty:
        document.getElementById(
            "sidebarEmpty"
        ),


    headerFavoriteCount:
        document.getElementById(
            "headerFavoriteCount"
        ),

    sidebarFavoriteCount:
        document.getElementById(
            "sidebarFavoriteCount"
        ),


    favoritesGrid:
        document.getElementById(
            "favoritesGrid"
        ),

    favoritesEmptyState:
        document.getElementById(
            "favoritesEmptyState"
        ),


    toast:
        document.getElementById("toast")

};


/* =========================================================
   TOAST TIMER
========================================================= */

let toastTimer = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    bindEvents();

    updateFavoriteCounters();

    handleRoute();

}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {


    /*
     * SEARCH
     */

    els.searchForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const query =
                els.searchInput.value.trim();


            if (!query) {

                showToast(
                    "Enter a product to search for."
                );

                els.searchInput.focus();

                return;
            }


            state.query = query;


            /*
             * If already on home,
             * perform search immediately.
             */

            if (
                window.location.hash === "#home" ||
                window.location.hash === ""
            ) {

                searchProducts(query);

            } else {

                window.location.hash =
                    "#home";

            }

        }
    );


    /*
     * SORT
     */

    els.sortSelect.addEventListener(
        "change",
        function () {

            renderMainProducts();

        }
    );


    /*
     * RETRY
     */

    els.retryButton.addEventListener(
        "click",
        function () {

            searchProducts(
                state.query
            );

        }
    );


    /*
     * FAVORITE BUTTONS
     *
     * Event delegation means we don't
     * need to attach listeners to every
     * card individually.
     */

    els.cardGrid.addEventListener(
        "click",
        handleFavoriteClick
    );


    els.favoritesGrid.addEventListener(
        "click",
        handleFavoriteClick
    );


    els.favoritesSidebarList.addEventListener(
        "click",
        handleFavoriteClick
    );


    /*
     * ROUTING
     */

    window.addEventListener(
        "hashchange",
        handleRoute
    );

}


/* =========================================================
   ROUTING
========================================================= */

function handleRoute() {

    const route =
        window.location.hash
            .replace("#", "")
            .toLowerCase();


    if (route === "favorites") {

        showFavoritesPage();

        return;
    }


    showHomePage();

}


function showHomePage() {

    els.homeView.hidden = false;

    els.favoritesView.hidden = true;

    els.breadcrumbCurrent.textContent =
        "Main Data";


    updateFavoriteCounters();

    renderSidebar();


    /*
     * Load products only if we
     * haven't loaded them yet.
     */

    if (state.products.length === 0) {

        searchProducts(
            state.query || DEFAULT_QUERY
        );

    } else {

        renderMainProducts();

    }

}


function showFavoritesPage() {

    els.homeView.hidden = true;

    els.favoritesView.hidden = false;

    els.breadcrumbCurrent.textContent =
        "Favorites";


    updateFavoriteCounters();

    renderFavoritesPage();

}


/* =========================================================
   API SEARCH
========================================================= */

async function searchProducts(query) {

    const cleanQuery =
        query.trim();


    if (!cleanQuery) {

        return;
    }


    /*
     * Increment request ID.
     *
     * This protects against an older
     * API request finishing after a
     * newer search.
     */

    const requestId =
        ++state.requestId;


    setLoading(true);

    clearError();

    els.emptySearchState.hidden =
        true;

    els.cardGrid.innerHTML =
        "";


    try {

        /*
         * IMPORTANT:
         *
         * encodeURIComponent prevents
         * spaces/special characters from
         * breaking the URL.
         */

        const url =
            `${API_BASE}?q=${encodeURIComponent(
                cleanQuery
            )}`;


        const response =
            await fetch(url, {

                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                }

            });


        /*
         * HTTP errors don't automatically
         * reject fetch(), so check manually.
         */

        if (!response.ok) {

            throw new Error(
                `Request failed with status ${response.status}`
            );

        }


        const data =
            await response.json();


        /*
         * Ignore stale requests.
         */

        if (
            requestId !==
            state.requestId
        ) {

            return;
        }


        /*
         * DummyJSON returns:
         *
         * {
         *   products: [],
         *   total: ...,
         *   skip: ...,
         *   limit: ...
         * }
         */

        state.products =
            Array.isArray(data.products)
                ? data.products
                : [];


        state.query =
            cleanQuery;


        els.searchInput.value =
            cleanQuery;


        renderMainProducts();


    } catch (error) {

        if (
            requestId !==
            state.requestId
        ) {

            return;
        }


        console.error(
            "Product search error:",
            error
        );


        state.products = [];


        showError(
            "The product service could not be reached. Check your connection and try again."
        );


    } finally {

        if (
            requestId ===
            state.requestId
        ) {

            setLoading(false);

        }

    }

}


/* =========================================================
   RENDER MAIN PRODUCTS
========================================================= */

function renderMainProducts() {

    const sortedProducts =
        sortProducts(
            state.products,
            els.sortSelect.value
        );


    const productsToRender =
        sortedProducts.slice(
            0,
            MAX_MAIN_RESULTS
        );


    els.cardGrid.innerHTML =
        "";


    /*
     * No results
     */

    if (
        state.products.length === 0
    ) {

        els.itemsCount.textContent =
            "0 items";

        els.emptySearchState.hidden =
            false;

        return;
    }


    els.emptySearchState.hidden =
        productsToRender.length !== 0;


    els.itemsCount.textContent =
        `${state.products.length} ${
            state.products.length === 1
                ? "item"
                : "items"
        }`;


    const fragment =
        document.createDocumentFragment();


    productsToRender.forEach(
        function (product) {

            fragment.appendChild(
                createProductCard(product)
            );

        }
    );


    els.cardGrid.appendChild(
        fragment
    );

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(
    product,
    favoritePage = false
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "data-card";


    card.dataset.productId =
        String(product.id);


    /*
     * IMAGE WRAPPER
     */

    const imageWrapper =
        document.createElement(
            "div"
        );


    imageWrapper.className =
        "card-image-wrapper";


    /*
     * IMAGE
     */

    const image =
        document.createElement(
            "img"
        );


    image.className =
        "card-image";


    image.src =
        getProductImage(product);


    image.alt =
        product.title;


    image.loading =
        "lazy";


    /*
     * If an API image fails,
     * create a local SVG fallback.
     */

    image.addEventListener(
        "error",
        function () {

            image.src =
                createFallbackImage(
                    product.title
                );

        },
        {
            once: true
        }
    );


    /*
     * BADGE
     */

    const badge =
        document.createElement(
            "span"
        );


    badge.className =
        "image-badge";


    badge.textContent =
        product.sku ||
        `ID-${product.id}`;


    imageWrapper.append(
        image,
        badge
    );


    /*
     * CONTENT
     */

    const content =
        document.createElement(
            "div"
        );


    content.className =
        "card-content";


    /*
     * TITLE
     */

    const title =
        document.createElement(
            "h2"
        );


    title.textContent =
        product.title;


    /*
     * DESCRIPTION
     */

    const description =
        document.createElement(
            "p"
        );


    description.textContent =
        product.description ||
        "No description available.";


    /*
     * FOOTER
     */

    const footer =
        document.createElement(
            "div"
        );


    footer.className =
        "card-footer";


    /*
     * META
     */

    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "product-meta";


    /*
     * PRICE
     */

    const price =
        document.createElement(
            "span"
        );


    price.className =
        "price";


    price.textContent =
        formatPrice(
            product.price
        );


    /*
     * RATING
     */

    const rating =
        document.createElement(
            "span"
        );


    rating.className =
        "card-rating";


    rating.textContent =
        `★ ${Number(
            product.rating || 0
        ).toFixed(1)}`;


    meta.append(
        price,
        rating
    );


    /*
     * FAVORITE BUTTON
     */

    const favoriteButton =
        document.createElement(
            "button"
        );


    const isFavorite =
        isProductFavorite(
            product.id
        );


    favoriteButton.type =
        "button";


    favoriteButton.className =
        `favorite-btn${
            isFavorite
                ? " is-favorite"
                : ""
        }`;


    favoriteButton.dataset.action =
        "toggle-favorite";


    favoriteButton.dataset.productId =
        String(product.id);


    favoriteButton.textContent =
        isFavorite
            ? "♥"
            : "♡";


    favoriteButton.setAttribute(
        "aria-label",
        isFavorite
            ? `Remove ${product.title} from favorites`
            : `Add ${product.title} to favorites`
    );


    favoriteButton.title =
        isFavorite
            ? "Remove from favorites"
            : "Add to favorites";


    /*
     * Favorite page class
     */

    if (favoritePage) {

        card.classList.add(
            "favorite-card"
        );

    }


    footer.append(
        meta,
        favoriteButton
    );


    content.append(
        title,
        description,
        footer
    );


    card.append(
        imageWrapper,
        content
    );


    return card;

}


/* =========================================================
   FAVORITE BUTTON
========================================================= */

function handleFavoriteClick(event) {

    const button =
        event.target.closest(
            "[data-action='toggle-favorite']"
        );


    if (!button) {

        return;
    }


    const productId =
        Number(
            button.dataset.productId
        );


    if (
        !Number.isFinite(productId)
    ) {

        return;
    }


    toggleFavorite(
        productId
    );

}


/* =========================================================
   TOGGLE FAVORITE
========================================================= */

function toggleFavorite(
    productId
) {

    const existingIndex =
        state.favorites.findIndex(
            product =>
                Number(product.id) ===
                productId
        );


    /*
     * REMOVE
     */

    if (existingIndex !== -1) {

        const removedProduct =
            state.favorites[
                existingIndex
            ];


        state.favorites.splice(
            existingIndex,
            1
        );


        saveFavorites();


        updateFavoriteCounters();

        renderSidebar();


        /*
         * Refresh whichever page
         * the user is currently viewing.
         */

        if (
            !els.favoritesView.hidden
        ) {

            renderFavoritesPage();

        } else {

            renderMainProducts();

        }


        showToast(
            `Removed "${removedProduct.title}" from favorites.`
        );


        return;
    }


    /*
     * ADD
     */

    const product =
        findProductById(
            productId
        );


    if (!product) {

        showToast(
            "This product is no longer available."
        );

        return;
    }


    /*
     * Store a clean copy.
     */

    state.favorites.unshift(
        sanitizeProductForStorage(
            product
        )
    );


    saveFavorites();


    updateFavoriteCounters();

    renderSidebar();


    if (
        !els.favoritesView.hidden
    ) {

        renderFavoritesPage();

    } else {

        renderMainProducts();

    }


    showToast(
        `Added "${product.title}" to favorites.`
    );

}


/* =========================================================
   FAVORITES PAGE
========================================================= */

function renderFavoritesPage() {

    els.favoritesGrid.innerHTML =
        "";


    const favorites =
        getFavoriteProducts();


    /*
     * Empty state
     */

    els.favoritesEmptyState.hidden =
        favorites.length !== 0;


    if (
        favorites.length === 0
    ) {

        return;
    }


    const fragment =
        document.createDocumentFragment();


    favorites.forEach(
        function (product) {

            fragment.appendChild(
                createProductCard(
                    product,
                    true
                )
            );

        }
    );


    els.favoritesGrid.appendChild(
        fragment
    );

}


/* =========================================================
   SIDEBAR
========================================================= */

function renderSidebar() {

    const favorites =
        getFavoriteProducts().slice(
            0,
            MAX_SIDEBAR_FAVORITES
        );


    els.favoritesSidebarList.innerHTML =
        "";


    els.sidebarEmpty.hidden =
        favorites.length !== 0;


    if (
        favorites.length === 0
    ) {

        return;
    }


    const fragment =
        document.createDocumentFragment();


    favorites.forEach(
        function (product) {

            fragment.appendChild(
                createSidebarFavorite(
                    product
                )
            );

        }
    );


    els.favoritesSidebarList.appendChild(
        fragment
    );

}


/* =========================================================
   SIDEBAR FAVORITE ITEM
========================================================= */

function createSidebarFavorite(
    product
) {

    const item =
        document.createElement(
            "article"
        );


    item.className =
        "favorite-item";


    item.dataset.productId =
        String(product.id);


    /*
     * IMAGE
     */

    const image =
        document.createElement(
            "img"
        );


    image.className =
        "favorite-thumb";


    image.src =
        getProductImage(product);


    image.alt =
        product.title;


    image.loading =
        "lazy";


    /*
     * INFO
     */

    const info =
        document.createElement(
            "div"
        );


    info.className =
        "favorite-info";


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        product.title;


    const description =
        document.createElement(
            "p"
        );


    description.textContent =
        product.description ||
        "No description available.";


    info.append(
        title,
        description
    );


    /*
     * REMOVE BUTTON
     */

    const button =
        document.createElement(
            "button"
        );


    button.className =
        "sidebar-favorite-btn";


    button.type =
        "button";


    button.dataset.action =
        "toggle-favorite";


    button.dataset.productId =
        String(product.id);


    button.setAttribute(
        "aria-label",
        `Remove ${product.title} from favorites`
    );


    button.title =
        "Remove from favorites";


    button.textContent =
        "♥";


    item.append(
        image,
        info,
        button
    );


    return item;

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadFavorites() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw) {

            return [];

        }


        const parsed =
            JSON.parse(raw);


        if (
            !Array.isArray(parsed)
        ) {

            return [];

        }


        return parsed
            .filter(
                product =>
                    product &&
                    Number.isFinite(
                        Number(product.id)
                    )
            )
            .map(
                sanitizeProductForStorage
            );


    } catch (error) {

        console.warn(
            "Could not load favorites:",
            error
        );


        return [];

    }

}


function saveFavorites() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                state.favorites
            )
        );

    } catch (error) {

        console.warn(
            "Could not save favorites:",
            error
        );


        showToast(
            "Favorites could not be saved."
        );

    }

}


/* =========================================================
   SANITIZE PRODUCT
========================================================= */

function sanitizeProductForStorage(
    product
) {

    return {

        id:
            Number(product.id),

        title:
            String(
                product.title ||
                "Untitled product"
            ),

        description:
            String(
                product.description ||
                "No description available."
            ),

        category:
            String(
                product.category ||
                ""
            ),

        price:
            Number(product.price) ||
            0,

        rating:
            Number(product.rating) ||
            0,

        stock:
            Number(product.stock) ||
            0,

        brand:
            String(
                product.brand ||
                ""
            ),

        sku:
            String(
                product.sku ||
                `ID-${product.id}`
            ),

        thumbnail:
            String(
                product.thumbnail ||
                ""
            ),

        images:
            Array.isArray(
                product.images
            )
                ? product.images
                    .slice(0, 5)
                    .map(String)
                : []

    };

}


/* =========================================================
   FAVORITE HELPERS
========================================================= */

function getFavoriteProducts() {

    return [
        ...state.favorites
    ];

}


function isProductFavorite(
    productId
) {

    return state.favorites.some(
        product =>
            Number(product.id) ===
            Number(productId)
    );

}


function findProductById(
    productId
) {

    /*
     * First search the products
     * currently returned by API.
     */

    const currentProduct =
        state.products.find(
            product =>
                Number(product.id) ===
                Number(productId)
        );


    if (currentProduct) {

        return currentProduct;

    }


    /*
     * If it isn't in the current
     * search results, look in favorites.
     */

    return state.favorites.find(
        product =>
            Number(product.id) ===
            Number(productId)
    ) || null;

}


/* =========================================================
   PRODUCT IMAGE
========================================================= */

function getProductImage(
    product
) {

    /*
     * DummyJSON provides thumbnail.
     */

    if (
        product.thumbnail
    ) {

        return product.thumbnail;

    }


    /*
     * Fallback to images array.
     */

    if (
        Array.isArray(
            product.images
        ) &&
        product.images.length > 0
    ) {

        return product.images[0];

    }


    /*
     * Final local fallback.
     */

    return createFallbackImage(
        product.title
    );

}


/* =========================================================
   FALLBACK IMAGE
========================================================= */

function createFallbackImage(
    title
) {

    const safeTitle =
        String(
            title || "Product"
        ).slice(0, 28);


    const svg = `

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="900"
            height="506"
            viewBox="0 0 900 506"
        >

            <rect
                width="900"
                height="506"
                fill="#e9edf1"
            />

            <text
                x="50%"
                y="50%"
                dominant-baseline="middle"
                text-anchor="middle"
                font-family="Arial, sans-serif"
                font-size="30"
                fill="#64748b"
            >
                ${escapeSvgText(safeTitle)}
            </text>

        </svg>

    `;


    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );

}


function escapeSvgText(
    value
) {

    return value

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&apos;"
        );

}


/* =========================================================
   PRICE
========================================================= */

function formatPrice(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "—";

    }


    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2
        }
    ).format(number);

}


/* =========================================================
   SORTING
========================================================= */

function sortProducts(
    products,
    sortType
) {

    const sorted =
        [
            ...products
        ];


    switch (sortType) {


        case "price-low":

            return sorted.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            );


        case "price-high":

            return sorted.sort(
                (a, b) =>
                    Number(b.price) -
                    Number(a.price)
            );


        case "rating":

            return sorted.sort(
                (a, b) =>
                    Number(b.rating) -
                    Number(a.rating)
            );


        case "az":

            return sorted.sort(
                (a, b) =>
                    String(a.title)
                        .localeCompare(
                            String(b.title)
                        )
            );


        case "featured":

        default:

            return sorted;

    }

}


/* =========================================================
   LOADING
========================================================= */

function setLoading(
    isLoading
) {

    els.loadingState.hidden =
        !isLoading;


    els.searchButton.disabled =
        isLoading;


    if (isLoading) {

        els.searchButton.innerHTML =
            "Searching...";

    } else {

        els.searchButton.innerHTML =
            `Search <span>→</span>`;

    }

}

function clearError() {

    els.errorState.hidden =
        true;

}


function showError(
    message
) {

    setLoading(false);


    els.errorMessage.textContent =
        message;


    els.errorState.hidden =
        false;


    els.emptySearchState.hidden =
        true;


    els.cardGrid.innerHTML =
        "";


    els.itemsCount.textContent =
        "0 items";

}



function updateFavoriteCounters() {

    const count =
        state.favorites.length;


    els.headerFavoriteCount.textContent =
        String(count);


    els.sidebarFavoriteCount.textContent =
        String(count);

}

function showToast(
    message
) {

    clearTimeout(
        toastTimer
    );


    els.toast.textContent =
        message;


    els.toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            function () {

                els.toast.classList.remove(
                    "show"
                );

            },
            2600
        );

}

