import { showMessage } from "./toast.js";


function updateCartCount(){
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total,item) => total + item.quantity,0);
    const cartCount = document.getElementById('cart-count');

    if(cartCount){
        cartCount.textContent = totalItems;

        if(totalItems === 0){
            cartCount.style.display ='none';
        }else{
            cartCount.style.display ='flex';
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    renderCart();
    updateCartCount();
});
function renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');

    cartItemsContainer.innerHTML = '';
    cartSummary.innerHTML = '';

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    
    if (cart.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'cart-empty-message';
        emptyMessage.textContent = "El carrito está vacío";
        cartItemsContainer.appendChild(emptyMessage);
       
        const backLink = createBackToShopButton();
        cartSummary.appendChild(backLink);
        return; 
    }

    
    cart.forEach((item, index) => {
        const cartItem = createCartItem(item, index);
        cartItemsContainer.appendChild(cartItem);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    createCartSummary(cartSummary, total);

    attachEventListeners(cart);
}


function createCartItem(item, index) {
    const cartItem = document.createElement ('div');
    cartItem.className = 'cart-item';

    const img = document.createElement ('img');
    img.src = item.img;
    img.alt = item.name;

   const info = document.createElement ('div');
   info.className = 'cart-item-info';
   
    const name = document.createElement ('h3');
    name.textContent = item.name;

    const price = document.createElement ('p');
    price.className= 'price';
    price.textContent = `Precio unitario: $${item.price}.00`;

    const stock = document.createElement ('p');
    stock.className = 'stock-display';
    stock.textContent = `Stock disponible: ${item.stock} unidades`;

    const quantityDiv = document.createElement ('div');
    quantityDiv.className = 'quantity';
    
    const label = document.createElement ('label');
    label.setAttribute ('for',`quantity-${index}`);
    label.textContent = 'Cantidad: ';

    const input = document.createElement ('input');
    input.type = 'number';
    input.id = `quantity-${index}`;
    input.value = item.quantity;
    input.min = 1;
    input.max = item.stock;
    input.setAttribute('data-index', index);

    const btnRemove = document.createElement ('button');
    btnRemove.className = 'btn-remove';
    btnRemove.setAttribute('data-index', index);
    btnRemove.textContent = 'Eliminar';

    quantityDiv.appendChild(label);
    quantityDiv.appendChild(input);
    quantityDiv.appendChild(btnRemove);

    const subtotal = document.createElement ('p');
    subtotal.className = 'subtotal';
    const subTotalValue = item.price * item.quantity;
    subtotal.textContent = `Subtotal: $${subTotalValue}.00`;
    

    info.appendChild(name);
    info.appendChild(price);
    info.appendChild(stock);
    info.appendChild(quantityDiv);
    info.appendChild(subtotal);

    cartItem.appendChild(img);
    cartItem.appendChild(info);

    return cartItem;
   
}

function createCartSummary(container, total) {
   const totalP = document.createElement ('p');
    totalP.className = 'cart-total';
    totalP.innerHTML =`<strong>Total a pagar:</strong> $${total}.00`;

    const summaryButtons = document.createElement('div');
    summaryButtons.className = 'cart-summary-buttons';

    const clearBtn = document.createElement ('a');
    clearBtn.href = '#';
    clearBtn.className = 'btn-cart btn-clear-cart';
    clearBtn.id = 'clear-cart';
    clearBtn.textContent = 'Vaciar carrito';

    const backLink = createBackToShopButton();
   

    const checkoutLink = document.createElement ('a');
    checkoutLink.href = './checkout.html';
    checkoutLink.className = 'btn-cart btn-checkout';
    checkoutLink.textContent = 'Finalizar compra';

    summaryButtons.appendChild(clearBtn);
    summaryButtons.appendChild(backLink);
    summaryButtons.appendChild(checkoutLink);

    container.appendChild(totalP);
    container.appendChild(summaryButtons);
   

    clearBtn.addEventListener('click', function(event){
        event.preventDefault();
        clearCart();
    });
}


function createBackToShopButton(){
    const backLink = document.createElement('a')
    backLink.href ='index.html'
    backLink.className ='btn-cart btn-back-shop';
    backLink.textContent = 'Volver a tienda'
    return backLink; 
}

function attachEventListeners(cart) {

   document.querySelectorAll('.quantity input').forEach(input => {
        input.addEventListener('change', (event) => {
            const index = parseInt(event.target.dataset.index);
            const newQuantity = parseInt(event.target.value);
            const item = cart[index];

            if (isNaN(newQuantity)) return;

            if (newQuantity > item.stock) {
                showMessage(`Cantidad solicitada excede el stock disponible (${item.stock} unidades)`,'warning');
                event.target.value = item.stock;
                updateQuantity(index,item.stock)
            } else if( newQuantity < 1) {
                showMessage(`Cantidad mínima permitida es 1`,'warning');
                event.target.value = 1;
                updateQuantity(index, 1);
            } else {
               updateQuantity(index, newQuantity); 
         }
        });
    });

    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = parseInt(event.target.dataset.index);
            if (event.target.id === 'clear-cart'){
                clearCart();
                
            }else if (index !== undefined){
                removeItem(parseInt(index));
            }
        });
    });
}


function updateQuantity(index, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
      
    renderCart();
    updateCartCount();
}


function removeItem (index){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index,1);
    localStorage.setItem('cart' , JSON.stringify(cart));
    renderCart();
    updateCartCount();
} 
function clearCart(){
        localStorage.removeItem('cart');
        showMessage('Carrito vaciado carrectamente', 'seccuess');
        renderCart();
        updateCartCount();
    }



