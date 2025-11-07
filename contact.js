import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } from "./env.js";
import { showMessage } from "./toast.js";

document.addEventListener("DOMContentLoaded", () =>{
  
      const airTableToken = AIRTABLE_TOKEN;
      const airTableBaseId = AIRTABLE_BASE_ID;

      const contactForm = document.getElementById('form-contacto');
      if(!contactForm) return;

      const messageBox = document.createElement('div');
      messageBox.id = 'message-box';
      contactForm.appendChild(messageBox);

      contactForm.addEventListener('submit',async (event)=>{
        event.preventDefault();

        const name = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('mensaje').value.trim();

        if (!name || !email || !message){
            showMessage('Completar todos los campos', 'error');
            return;
        }

        const contact ={
            fields:{
                Name:name,
                Email:email,
                Message:message,
            },
        };

        try {
            const response = await fetch(`https://api.airtable.com/v0/${airTableBaseId}/contacts`,{
            method:'POST',
            headers:{
               'Authorization': `Bearer ${airTableToken}`,
                    'Content-Type': 'application/json'
            },
            body:JSON.stringify(contact)
            });

            showMessage('¡Mensaje enviado con exito! Te respoderemos pronto', 'success')
            contactForm.reset();

        }catch (error){
            console.error('Error al enviar el mensaje', error);
            showMessage('Hubo un error, intenta nuevamente','error');
        }
      });
} )