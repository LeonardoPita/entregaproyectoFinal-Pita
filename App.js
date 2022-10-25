
/* ------------------------------VARIABLES---------------------------------- */

const cartBtn = document.querySelector(".cart-btn");
const payBtn = document.querySelector(".pay");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
let myCart = [];
let myCartDom = [];
let cartQuantity = 0;
const tax = 1.21;
let subTotal = 0;
let qty = 0;
let total = 0;


getAndFillCartFromSessionStorage();
/* ------------------------------PRODUCTS DISPLAY FROM DATA.JSON---------------------------------- */

const products = fetch('./data.json')                      ////////////////////////////***************FETCH*****************///////////////////////////////////////
    .then((response) => response.json())
    .then((products) => {
        products.forEach(({ id, title, price, img, quantity }) => {
            let productContent = document.createElement("article");
            productContent.classList.add("product");
            productContent.innerHTML = `<div class="img-container">
                                        <img src="${img}"
                                            alt="product car decal" class="product-img">
                                        <button class="bag-btn" id="${id}">
                                            <i class="fas fa-shopping-cart"></i>
                                            click the image to add to the cart
                                        </button>
                                        </div>
                                        <h3>${title}</h3>
                                        <h4>$${price}</h4>`
            productsDOM.append(productContent);
            /* ----------CLICK PRODUCT TO ADD AND SUM IN THE BASQUET---------------------------- */

            productContent.addEventListener("click", () => {
                Toastify({
                    text: "Item adeed to your cart",
                    duration: 2000,
                    offset: {
                        x: 0,
                        y: 50
                    },
                    style: {
                        background: '#00be95'
                    }
                }).showToast();
                let productAlreadyExists = addItemToCart({ id, title, price, img, quantity });
                if (productAlreadyExists) return;
                myCart.push(products[id - 1]);
                setMyCartToSessionStorage();
                createCartElement({ id, title, price, img, quantity });
            })
        });
    });

function createCartElement(product) {
    let cartItems = document.createElement("div");
    cartItems.setAttribute('id', `${product.id}_cart_item`);
    myCartDom.push(cartItems);
    cartItems.classList.add("cart-item");
    cartItems.innerHTML = `<img src="${product.img}" alt="product car decal">
                                <div>
                                    <h4>${product.title}</h4>
                                    <h5>${product.price}</h5>
                                    <span class="remove-item">Delete</span>
                                </div>
                                <div>
                                    <i class="fas fa-chevron-up" id="${product.id}_cart_up"></i>
                                    <p class="item-amount" id="${product.id}_cart_product">${product.quantity}</p>
                                    <i class="fas fa-chevron-down" id="${product.id}_cart_down"></i>
                                </div>`
    setTimeout(function () {
        addEventListenerToCartArrows(`${product.id}_cart_up`, "up", product);
        addEventListenerToCartArrows(`${product.id}_cart_down`, "down", product);
    }, 1);
    cartContent.append(cartItems);
}

function addEventListenerToCartArrows(id, operation, product) {
    document.getElementById(id).addEventListener("click", () => {
        addItemToCart(product, operation);
    });
}

function addCartIcon(operation) {
    operation == 'down' ? cartQuantity-- : cartQuantity++;
    cartItems.innerText = cartQuantity;
}

function addItemToCart(product, operation) {
    let productAlreadyExists;
    addCartIcon(operation);
    myCart.find(function (cartObj, index) {
        if (cartObj.id == product.id) {
            operation == 'down' ? cartObj.quantity-- : cartObj.quantity++;
            productAlreadyExists = true;
            document.getElementById(`${product.id}_cart_product`).innerText = cartObj.quantity;
            cartObj.quantity == 0 && removeItemFromCart(cartObj, index);
        }
    })
    setMyCartToSessionStorage();
    return productAlreadyExists;
}


function removeItemFromCart(cartObj, index) {
    document.getElementById(`${cartObj.id}_cart_item`).remove();
    myCart.splice(index, 1);                ////////////////////////////////////////////FIX BUG WEN DELETING THE FIRST ITEM/////////////////
}

/* --------------------------------FUNCTIONS FOR OPEN AND CLOSE THE CART----------------------- */

const changeCartStyles = () => {
    cartDOM.classList.toggle("showCart");
    cartOverlay.classList.toggle("transparentBcg");
}
const toggleCartOpenClose = () => {
    cartBtn.addEventListener("click", changeCartStyles);
    closeCartBtn.addEventListener("click", changeCartStyles);
}
toggleCartOpenClose();
/* -------------------------------- DELETE BUTTON IN THE CART----------------------- */
clearCartBtn.addEventListener("click", function () {
    cartQuantity = 0;
    cartItems.innerText = 0;
    for (let i = 0; i < myCartDom.length; i++) {
        document.getElementById(`${myCart[i].id}_cart_product`).innerText = 0;
        myCart[i].quantity = 1;
        myCartDom[i].remove();
    }
    qty = 0;
    subTotal = 0;
    total = 0;
    myCart = [];
    myCartDom = [];
    setMyCartToSessionStorage();
});
/* --------------------------------CALCULATE CART----------------------- */
function calculateCart() {
    Object.keys(myCart).forEach((key) => {
        qty += myCart[key].quantity;
        subTotal += myCart[key].price * myCart[key].quantity;
        total = subTotal * tax;
        total.toFixed(2);
    })
};

/* --------------------------------PAY BUTTON----------------------- */
    payBtn.addEventListener("click", () => {
        calculateCart();
        if (total === 0) {
            Swal.fire("No products in your cart")
        } else {
        Swal.fire({
            title: 'These are your purchase details:',
            text: `You bought ${qty} items, whith a subtotal of ${subTotal} and a total of ${total}.`,
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Understood'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Success!',
                    'Your purchase will arrive in a few days.',
                    'success'
                )
            }
        })
        cartQuantity = 0;
        cartItems.innerText = 0;
        for (let i = 0; i < myCartDom.length; i++) {
            document.getElementById(`${myCart[i].id}_cart_product`).innerText = 0;
            myCart[i].quantity = 1;
            myCartDom[i].remove();
        }
        qty = 0;
        subTotal = 0;
        total = 0;
        myCart = [];
        myCartDom = [];
        setMyCartToSessionStorage();
    
        }
    });




/* --------------------------------SESSION STORAGE----------------------- */

function setMyCartToSessionStorage() {
    localStorage.setItem("myCart", JSON.stringify(myCart));
    localStorage.setItem("cartQuantity", JSON.stringify({ cartValue: cartQuantity }));
}

function getAndFillCartFromSessionStorage() {
    let storageCart = window.localStorage.getItem("myCart");
    let temp = window.localStorage.getItem("cartQuantity");
    if (JSON.parse(temp) && JSON.parse(temp).cartValue) {
        cartItems.innerText = JSON.parse(temp).cartValue;
        cartQuantity = JSON.parse(temp).cartValue;
    }
    if (JSON.parse(storageCart)) {
        myCart = JSON.parse(storageCart);
        for (let i = 0; i < myCart.length; i++) {
            createCartElement(myCart[i]);
        }
    }
};



