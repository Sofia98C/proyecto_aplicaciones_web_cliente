document.addEventListener("DOMContentLoaded",() =>{

//data
    const listProduct=[
        {name:"Chaleco Salvavidas para perro", price: 38500,img:"./img/imagen6.webp", category: 'perro'},
        {name:"Pechera para perro", price: 15500,img:"./img/imagen2.webp", category:'perro' },
        {name:"Correa retratil", price: 20500,img:"./img/imagen3.webp", category: 'perro'},
        {name:"Contenedor para alimento", price: 25500,img:"./img/imagen4.webp", category:'perro'},
        {name:"Limpia Patas", price: 16600,img:"./img/imagen5.webp",category:'gato'},
        {name:"Bebedero y comedero", price: 50500,img:"./img/imagen1.webp",category:'gato'},
        {name:"Bolso transportador", price: 60500,img:"./img/imagen7.webp",category:'perro'},
        {name:"Masajeador", price: 24100,img:"./img/imagen8.webp",category:'gato'},
        {name:"Mantilla", price: 24100,img:"./img/imagen9.webp",category:'perro'},
    ]
 // elementos Dom
    const productsDomElement= document.querySelector('.product-container');
    const inputSearch= document.getElementById('input-search-product');
    const categoryLink= document.querySelectorAll('.category-product-filter');

// variable 

let currentCategory = '';
let currentSearch = '';
   

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

function filterproduct(text){
    const filtered= listProduct.filter(product => product.name.toLowerCase().includes(text.toLowerCase()));
    return filtered;
}

function filterProductByCategory(category){
    const filtered= listProduct.filter(product => product.category === category);
    return filtered;
}

function renderProduct(product){
    productsDomElement.innerHTML= '';
    product.forEach(product=>{
    const newProduct = createProduct(product);
    productsDomElement.appendChild(newProduct);
    })
}
function combinedFilter(){
    let filtered = listProduct;
    if (currentCategory){
        filtered = filtered.filter (product =>product.category === currentCategory);
    }
    if(currentSearch){
        filtered = filtered.filter(product => product.name.toLowerCase().includes(currentSearch.toLowerCase()));

    }

    renderProduct(filtered);
 }



// eventos

inputSearch.addEventListener('keyup',(event)=>{
    currentSearch= event.target.value;
    combinedFilter();
})

 categoryLink.forEach(link =>{
    link.addEventListener('click',(event)=>{
        event.preventDefault();
        const category= event.target.innerText.toLowerCase();
        if(currentCategory === category){
            currentCategory = '';
        }
        else{
            currentCategory = category;

        }
        combinedFilter();
    });

});

// inicializacion

renderProduct(listProduct);
});