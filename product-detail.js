import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID} from './config.js';


document.addEventListener("DOMContentLoaded", () => {
loadProductDetail();
});


const airTableToken = AIRTABLE_TOKEN;
const airTableBaseId = AIRTABLE_BASE_ID;

async function loadProductDetail(){
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId){
        alert("Producto no encontrado");
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

        const product = {
            id: record.id,
            name: record.fields.Name,
            price: record.fields.Price,
            category: record.fields.Category,
            description: record.fields.Description || "Sin descripcion disponible",
            images: record.fields.Image.map(img => img.url),
        };
        renderProductDetail(product);

        const addToCartButton = document.getElementById('add-to-cart-button');
        addToCartButton.addEventListener('click', (event) => {
            event.preventDefault();
            addToCart(product);
            alert("Producto agregado al carrito");
           
        });
    } catch (error){
        console.error('Error al cargar el detalle del producto:', error);
        alert("Error al cargar el producto");
        window.location.href = "index.html";
    }
}
function renderProductDetail (product){
    const titleElement = document.querySelector('.product-detail h2' );
    if (titleElement) {
        titleElement.textContent = product.name;
    }   
    const imgContainer = document.getElementById('img-container');
    if (imgContainer) {
        imgContainer.innerHTML = '';
        product.images.forEach(imgUrl => {
            const imgElement = document.createElement('img');
            imgElement.src = imgUrl;
            imgElement.alt = product.name;
            imgContainer.appendChild(imgElement);
        });
    }
   
    const descriptionElement = document.getElementById('product-description');
   if (descriptionElement) {
       const descriptionP = descriptionElement.querySelector('p');
       if (descriptionP) {
           descriptionP.textContent = product.description;
       }    
    }
    const priceElement = document.getElementById('product-price');
    if (priceElement) {
        priceElement.textContent = `$${product.price}.00`;
    }
    

function addToCart(product){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingitem = cart.find(item => item.id === product.id);
    if (existingitem){
        existingitem.quantity += 1;
    }else{
           cart.push({
           id: product.id,
           name: product.name,
           price: product.price,
           img: product.images[0],
           quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

}
}