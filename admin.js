import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } from "./env.js";
import { showMessage } from "./toast.js";

const airTableToken = AIRTABLE_TOKEN;
const airTableBaseId = AIRTABLE_BASE_ID;

let products = [];
let editingProductId = null;
let formHasChanges = false;

document.addEventListener("DOMContentLoaded", ()=> {
    loadProducts();

    const productForm = document.getElementById('product-form');
    const btnCancel = document.getElementById('btn-cancel');

    if(productForm){ 
        productForm.addEventListener("submit",handleSubmit);
        productForm.addEventListener("input", ()=>{
            formHasChanges = true;
        });
}

    if (btnCancel){
        btnCancel.addEventListener('click',resetForm);   
    }
});
window.addEventListener('beforeunload',event =>{
    if(formHasChanges && editingProductId){
        event.preventDefault();
        event.returnValue = '';
    }
});

async function loadProducts () {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="table-message">Cargando productos...</td></tr>';

    try{
         const response = await fetch(`https://api.airtable.com/v0/${airTableBaseId}/Products`, {
            headers: { 
                Authorization: `Bearer ${airTableToken}`
             }
        });

        const data = await response.json();

        products = data.records.map(record => ({
              id: record.id,
              name:record.fields.Name,
              price:record.fields.Price,
              category: record.fields.Category,
              stock: record.fields.Stock || 0,
              description: record.fields.Description || '',
              img: record.fields.Image && record.fields.Image[0] ? record.fields.Image[0].url : '',
              images: record.fields.Image || [] 

    }));
 
    renderProductsTable();

    }catch(error){
        console.error('Error al cargar los productos', error);
        showMessage('Error al cargar productos','error');
        tbody.innerHTML = '<tr><td colspan="6" class="table-message" style="color: red;">Error al cargar productos</td></tr>';
    }
}

function renderProductsTable(){
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';

    if(products.length === 0){
        const row = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan','7') ;
        td.className = 'table-massege';
        td.textContent = 'No hay productos';
        row.appendChild(td);
        tbody.appendChild(row);
        return;
    }
    products.forEach(product =>{
    const row = createProductRow(product);
    tbody.appendChild(row);    
    });
}

function createProductRow(product){
    const row = document.createElement('tr');

    
    
    const tdImg = document.createElement('td');
    const img = document.createElement('img');
    img.src = product.img  || './img/placeholder.jpg';
    img.alt = product.name;
    img.className = 'product-img-preview';
       img.onerror = function() {
        this.src = './img/placeholder.jpg';
    };
    tdImg.appendChild(img);

    const tdName = document.createElement('td');
    tdName.textContent = product.name;


    const tdPrice = document.createElement('td');
    tdPrice.textContent = `$${product.price}.00`;


    const tdCategory = document.createElement('td');
    tdCategory.textContent = product.category;

    const tdDescription =  document.createElement('td');
    tdDescription.textContent = product.description || "-";

    const tdStock = document.createElement('td');
    tdStock.textContent = product.stock;
    tdStock.className = 'stock-cell';

    if(product.stock > 5){
        tdStock.classList.add('stock-high');
         } else if (product.stock > 0) {
        tdStock.classList.add('stock-medium');
    } else {
        tdStock.classList.add('stock-empty');
    }

    const tdActions = document.createElement('td');

    const btnEdit = document.createElement('button');
    btnEdit.classList.add ('btn-edit');
    btnEdit.textContent = 'Editar';
    btnEdit.addEventListener('click',() => editProduct (product.id));

    
    const btnDelete = document.createElement('button');
    btnDelete.classList.add('btn-delete');
    btnDelete.textContent = 'Eliminar';
    btnDelete.addEventListener('click',() => deleteProduct (product.id,product.name));

    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDelete);

    row.appendChild(tdImg);
    row.appendChild(tdName);
    row.appendChild(tdPrice);
    row.appendChild(tdCategory);
    row.appendChild(tdDescription);
    row.appendChild(tdStock);
    row.appendChild(tdActions);


    return row;
}

async function handleSubmit(event) {
    event.preventDefault();

    
     const name = document.getElementById('product-name').value.trim();
     const price = parseFloat( document.getElementById('product-price').value);
     const category= document.getElementById('product-category').value;
     const stock= parseInt(document.getElementById('product-stock').value);
     const description= document.getElementById('product-description').value.trim();
    
    
     const imagesInput= document.getElementById('product-images').value.trim();
     const newImages= processImagesUrl(imagesInput);
    
    

     if(!name){
        return showMessage('El nombre del producto es necesario', 'warning');
     }
     if(isNaN(price) || price <= 0){
        return showMessage('El precio debe ser mayor a 0', 'warning');
     }
     if(!category){
        return showMessage('Debes seleccionar una categoria','warning');
     }
     if(isNaN(stock) || stock < 0){
        return showMessage('El stock no puede ser menor a 0','warning');
     }

     if (newImages.length === 0){
        return showMessage('Dbes agregar al menos una URL de imagen','warning');

     }

     const productData ={
        fields:{
            Name:name,
            Price:price,
            Category:category,
            Stock:stock,
            Description:description,
            Image:newImages.slice(0,3)
        }
};

const submitBtn = event.target.querySelector('button[type="submit"]');
const originalText = submitBtn.textContent;
submitBtn.disabled = true;
submitBtn.textContent = 'Guardando...';


try{
    let response;

    if(editingProductId){
         response = await fetch(`https://api.airtable.com/v0/${airTableBaseId}/Products/${editingProductId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${airTableToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            if (response.ok) showMessage('Producto actualizado con exito', 'success')
    }else {
        response = await fetch(`https://api.airtable.com/v0/${airTableBaseId}/Products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${airTableToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            if (!response.ok) showMessage('Producto creado con exito', 'success');
        }
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error al guardar el producto');
        }

        formHasChanges=false;
        resetForm();
        loadProducts();

    }catch(error){
        console.error('Error al guardar productos', error);
        showMessage('Error al guardar producto','error');
    }finally{
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function processImagesUrl(imagesInput){
    if(!imagesInput) return [];

    return imagesInput.split(',')
        .map(url => url.trim())
        .filter(url => url )
        .map(url => ({url}));

}


function editProduct(productId){
    const product = products.find(p => p.id === productId);

    if(!product)return showMessage('Producto no encontrado', 'error');

    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-description').value = product.description;
    

    
     const imagesString = product.images ? product.images.map(img => img.url).join(', '): (product.img ? product.img : '');
    
    document.getElementById('product-images').value = imagesString;

    document.getElementById('product-title').textContent = 'Editar Producto';
    editingProductId = productId;
    formHasChanges = false;

    window.scrollTo({top: 0, behavior: 'smooth'});
    
}


async function  deleteProduct(productId,productName){
   
    try{    
    const response = await fetch(`https://api.airtable.com/v0/${airTableBaseId}/Products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${airTableToken}` }
        }); 

        showMessage('Producto eliminado con exito', 'success');
        loadProducts();
    }catch(error){
        console.error('Error al eliminar producto', error);
        showMessage('Error al eliminar producto','error');
    }

}

function resetForm(){
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
   document.getElementById('product-title').textContent = 'Agregar nuevo producto';
    editingProductId = null;
    formHasChanges = false;
}



