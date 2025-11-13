import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID} from './env.js';
import { showMessage } from './toast.js';

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

document.addEventListener("DOMContentLoaded", () => {
  loadProductDetail();
  updateCartCount();
});

const airTableToken = AIRTABLE_TOKEN;
const airTableBaseId = AIRTABLE_BASE_ID;

async function loadProductDetail(){
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId){
        showMessage("Producto no encontrado");
        window.location.href = "index.html";
        return;
    }
    try {
        const response = await fetch(`https://api.airtable.com/v0/${airTableBaseId}/Products/${productId}`, {
            headers: {
                Authorization: `Bearer ${airTableToken}`
            }
        });


        const record = await response.json();
        const fields = record.fields;

        const product = {
            id: record.id,
            name: fields.Name,
            price: fields.Price,
            category: fields.Category,
            description: fields.Description || "Sin descripcion disponible",
            images: fields.Image.map(img => img.url),
            stock: fields.Stock || 0
        };
        renderProductDetail(product);

        const addToCartButton = document.getElementById('add-to-cart-button');
        if (addToCartButton){
        addToCartButton.addEventListener('click', (event) => {
        
            if (product.stock <= 0){
                showMessage("Producto son stock", "error");
            return;
}

        addToCart(product);
        showMessage(`${product.name} agregado al carrito`, "success");
        updateCartCount();
    });
}
    
    } catch (error){
        console.error('Error al cargar el detalle del producto:', error);
        showMessage("Error al cargar el producto", "error");
        window.location.href = "index.html";
    }
}
function renderProductDetail (product){
    const titleElement = document.querySelector('.product-detail h2' );
    if (titleElement) titleElement.textContent = product.name;
     
    const imgContainer = document.getElementById('img-container');
    if (imgContainer) {
        imgContainer.innerHTML = '';
        if(product.images.length > 0){
            product.images.forEach(imgUrl => {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = product.name;
            imgContainer.appendChild(img);
        });
    }else {
        imgContainer.textContent = 'Sin imagen disponible';
    }
}
   
    const descriptionElement = document.querySelector('#product-description p');
   if (descriptionElement) descriptionElement.textContent = product.description;
     
    const priceElement = document.getElementById('product-price');
    if (priceElement) priceElement.textContent = `$${product.price}.00`;
}
    

function addToCart(product){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingitem = cart.find(item => item.id === product.id);
   
    if (existingitem){
        existingitem.quantity += 1;
    } else {
           cart.push({
             id: product.id,
             name: product.name,
             price: product.price,
             img: product.images[0],
             quantity: 1,
             stock:product.stock 
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));


}
