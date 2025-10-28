
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

function createProduct (product){
    const newProduct= document.createElement('div');
    newProduct.setAttribute("class","product-item");

    const newAnchor= document.createElement('a');
    newAnchor.setAttribute("href","product-detail.html" );
    
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

    const buttonAddToCart= document.createElement('button');
    buttonAddToCart.innerText="Agregar al carrito";
    buttonAddToCart.addEventListener('click', (event)=>{
        event.preventDefault();
        console.log(`agregando al carrito: ${product.name}`);

    });

   

    newDiv.appendChild(newName);
    newDiv.appendChild(newPrice);
    newDiv.appendChild(buttonAddToCart);
    newAnchor.appendChild(newImg);
    newAnchor.appendChild(newDiv);
    newProduct.appendChild(newAnchor);

    return newProduct;
    
}


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
            img: record.fields.Image[0].url,
        }));
        renderProduct(products);
    } catch (error){
        console.error('Error fetching products from Airtable:', error);
    }
}
getProductsFromAirtable();
});
