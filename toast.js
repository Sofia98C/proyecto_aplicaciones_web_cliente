export function showMessage (text,type = "success"){
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.innerHTML = text;

    document.body.appendChild(toast);

    setTimeout (() => toast.classList.add('visible'),10);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(()=> toast.remove (), 300);   
    },3000);
}