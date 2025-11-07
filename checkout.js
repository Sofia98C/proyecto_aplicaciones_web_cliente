import { AIRTABLE_TOKEN,AIRTABLE_BASE_ID } from "./env.js";
import { showMessage } from "./toast.js";

  const airTableToken = AIRTABLE_TOKEN;
  const airTableBaseId = AIRTABLE_BASE_ID;

document.addEventListener("DOMContentLoaded", ()=>{
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutSection = document.querySelector('.checkout');
    if (!checkoutSection) return;


    if (cart.length === 0){
        showMessage('Tu carrito esta vacio. Enviando a pantalla pricipal...','error');
        setTimeout(()=> (window.location.href = 'index.html'), 2500);
        return;
    }

    renderCartSummary(cart);

    const checkoutForm = document.querySelector('.checkout-form');
    if (!checkoutForm) return;
    
    checkoutForm.addEventListener('submit', handleCheckout);

    async function handleCheckout(event) {
        event.preventDefault();


        const nameInput = document.querySelector('#name');
        const emailInput = document.querySelector('#email');
        const addressInput = document.querySelector('#address');

        if (!nameInput || !emailInput || !addressInput){
            showMessage('No se puedo cargar los campos del formulario ','error');
            return;
        }
        const  name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const  address = addressInput.value.trim();

         if (!name || !email || !address){
            showMessage('Completar todos los campos','error');
            return;
         }

        const total = cart.reduce((sum,item)=> sum + (item.price * item.quantity),0);
        
        const order = {
            fields:{
                Name:name,
                Email:email,
                Address:address,
                Total:total,
                OrderDate:new Date().toDateString(),
                Products:JSON.stringify(cart.map (p => ({name:p.name, quantity:p.quantity})))
            }
        };

        try {
            const orderResponse = await fetch(`https://api.airtable.com/v0/${airTableBaseId}/Orders`, {
                 method: 'POST',
                headers: {
                    'Authorization': `Bearer ${airTableToken}`,
                    'Content-Type': 'application/json'
                },

                body:JSON.stringify(order)
            });  

            for (const item of cart){
                const newStock = item.stock - item.quantity;
                await fetch(`https://api.airtable.com/v0/${airTableBaseId}/Products/${item.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${airTableToken}`,
                        'Content-Type': 'application/json'
                    },
                     body: JSON.stringify({ fields: { Stock: newStock } })
                });
            }
            
            
            localStorage.removeItem('cart');
            showMessage('¡Compra realizada con exito!. Volviendo a la pagina principal', 'success');
            setTimeout(()=> (window.location.href = 'index.html'), 3000);

    }catch(error){
        console.error('Error al procesar la compra', error);
        showMessage('Hubo un error al procesar tu compra. Intenta nuevamente', 'error');

    }
}

function renderCartSummary (cart){
    const form = document.querySelector('.checkout-form');
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'cart-summary-checkout';


    const title = document.createElement('h3');
    title.textContent = 'Resumen de tu compra';
    summaryDiv.appendChild(title);

    
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-summary';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${item.name} (${item.quantity})`;

        const priceSpan = document.createElement('span');
        priceSpan.textContent = `$${(item.price * item.quantity)}.00`;

        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(priceSpan);
        summaryDiv.appendChild(itemDiv);
    });

    const totalAmount = cart.reduce((sum,item)=> sum + (item.price * item.quantity), 0);
    const totalDiv = document.createElement('div');
    totalDiv.className = 'total-summary';

    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'Total:';

    const totalValue = document.createElement('span');
    totalValue.textContent = `$${totalAmount}.00`;
   
    totalDiv.appendChild(totalLabel);
    totalDiv.appendChild(totalValue);
    summaryDiv.appendChild(totalDiv);


    form.parentNode.insertBefore(summaryDiv, form);
}
});
