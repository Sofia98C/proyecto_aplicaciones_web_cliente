import { airTableToken, airTableBaseId} from './config.js';

document.addEventListener("DOMContentLoaded",() =>{

 // elementos Dom
    const productsDomElement= document.querySelector('.product-container');
    const inputSearch= document.getElementById('input-search-product');
    const categoryLink= document.querySelectorAll('.category-product-filter');

// variable 

let currentCategory = '';
let currentSearch = '';
let products = [];   

//funciones

function createProduct (product) {
    const newProduct= document.createElement('div');
    newProduct.setAttribute("class","product-item");

    const newAnchor= document.createElement('a');
    newAnchor.setAttribute("href",`product-detail.html?id=${product.id}`);
    
    const newImg= document.createElement('img');
    newImg.setAttribute("src",product.img);
    newImg.setAttribute("alt",product.name);

    const newDiv= document.createElement('div');
    newDiv.setAttribute("class","info-product");

    const newName= document.createElement('h2');
    newName.setAttribute("class","name");
    newName.innerText = product.name;

    const newPrice= document.createElement ('p');
    newPrice.setAttribute("class","price");
    newPrice.innerText= `Precio: $${product.price}.00 `;
    
    const buttonAddToCart = document.createElement('button');
    buttonAddToCart.innerText = 'Añadir al carrito';
    
     buttonAddToCart.addEventListener('click',(event)=>{
        event.preventDefault();
    addToCart(product);

    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => {
            cartIcon.classList.remove('cart-bounce');
        }, 600);
    }
    
});

 
    newDiv.appendChild(newName);
    newDiv.appendChild(newPrice);
    newDiv.appendChild(buttonAddToCart);
    newAnchor.appendChild(newImg);
    newAnchor.appendChild(newDiv);
    newProduct.appendChild(newAnchor);

    return newProduct;
};



function renderProduct(productlist){
    productsDomElement.innerHTML= '';
    productlist.forEach(product=>{
     const newProduct = createProduct(product);
     productsDomElement.appendChild(newProduct);
    })
}

function combinedFilter(){
    let filtered = products;
    if (currentCategory){
        filtered = filtered.filter (p => p.category === currentCategory);
    }
    if(currentSearch){
        filtered = filtered.filter(p => p.name.toLowerCase().includes(currentSearch.toLowerCase()));    
    }
    renderProduct (filtered);
}

function addToCart(product){
    let cart = JSON.parse (localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            stock: product.stock,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

 
    
}
// eventos

inputSearch.addEventListener('keyup',(event)=>{
    currentSearch= event.target.value;
    combinedFilter();
});

 categoryLink.forEach(link =>{
    link.addEventListener('click',(event)=>{
        event.preventDefault();
        const category= event.target.innerText.toLowerCase();
        currentCategory = currentCategory===category ? '' : category;
            combinedFilter();
        
    });

});


async function getProductsFromAirtable(){
    try{
        const response = await fetch(`https://api.airtable.com/v0/${airTableBaseId}/Products`, {
            headers: {
                Authorization: `Bearer ${airTableToken}`
            }
        });
       
       
            const data = await response.json();
       
             products = data.records.map(record => ({
            id: record.id,
            name: record.fields.Name,
            price: record.fields.Price,
            category: record.fields.Category,
            stock: record.fields.Stock || 0,
            img: record.fields.Image[0].url,
        }));
        renderProduct(products);
    } catch (error){
        console.error('Error al obtener los productos:', error);
    }
}
getProductsFromAirtable();

}

);
