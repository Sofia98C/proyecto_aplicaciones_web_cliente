import { showMessage } from "./toast.js";

document.addEventListener('DOMContentLoaded', async () => {
    renderCart();
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

    const backLink = createBackToShopButton();
    cartSummary.appendChild(backLink);

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

    const checkoutLink = document.createElement ('a');
    checkoutLink.href = './checkout.html';
    checkoutLink.className = 'btn';
    checkoutLink.textContent = 'Finalizar compra';

    const clearBtn = document.createElement ('button');
    clearBtn.className = 'btn-remove';
    clearBtn.id = 'clear-cart';
    clearBtn.textContent = 'Vaciar carrito';

    container.appendChild(totalP);
    container.appendChild(checkoutLink);
    container.appendChild(clearBtn);

    clearBtn.addEventListener('click', clearCart);
}


function createBackToShopButton(){
    const backLink = document.createElement('a')
    backLink.href ='index.html'
    backLink.className ='btn btn-back-shop';
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
}


function removeItem (index){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index,1);
    localStorage.setItem('cart' , JSON.stringify(cart));
    renderCart();
} 
function clearCart(){
    if (confirm('¿ Estas seguro de que quieres vaciar el carrito?')){
        localStorage.removeItem('cart');
        renderCart();
    }

}

