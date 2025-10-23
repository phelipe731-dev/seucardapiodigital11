// -----------------------------
// GET & SET CART
// -----------------------------
const cartNotify = document.querySelector('.cartNotify');

// Pegar carrinho do localStorage
const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];

// Salvar carrinho no localStorage
const setCart = cartData => localStorage.setItem('cart', JSON.stringify(cartData));

// -----------------------------
// NOTIFICAÇÕES
// -----------------------------
const notification = Toastify({
    text: "Produto adicionado no carrinho de compras.",
    duration: 5000,
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
        background: "#FF7F0A",
        boxShadow: "0 0 160px 0 #0008"
    }
});

const showingNotifications = () => {
    const cart = getCart();
    if (cart.length > 0) cartNotify.style.display = 'block';
};

showingNotifications();

// -----------------------------
// ADD TO CART
// -----------------------------
const addToCart = id => {
    const cart = getCart();

    if (cart.length > 0) {
        let wasModified = false;
        cart.forEach(item => {
            if (item.id === id) {
                item.qtd += 1;
                wasModified = true;
            }
        });
        if(!wasModified) cart.push({ id: id, qtd: 1 });
    } else {
        cart.push({ id: id, qtd: 1 });
    }

    setCart(cart);
    notification.showToast();
    showingNotifications();
};

// -----------------------------
// CUPONS
// -----------------------------
const promotionCodes = {
    easteregg: 10,
    blackfriday: 20,
    summer2025: 15
};

// -----------------------------
// GERAR CARRINHO COMPLETO
// -----------------------------
const generateCart = () => {
    const cart = getCart();
    const allProducts = getProducts(); // [{id, name, price}]
    return cart.map(item => {
        const product = allProducts.find(p => p.id === item.id);
        return {
            id: item.id,
            name: product ? product.name : 'Produto desconhecido',
            price: product ? product.price : 0,
            qtd: item.qtd
        };
    });
};

// -----------------------------
// GERAR PEDIDO E ABRIR WHATSAPP
// -----------------------------
const generateOrder = (userName, userCoupon, wantsDelivery, deliveryAddress, paymentMethod) => {
    const cartItems = generateCart();
    if(cartItems.length === 0) return alert("Carrinho vazio!");

    let totalItems = 0;
    const deliveryFee = wantsDelivery ? 3 : 0;
    cartItems.forEach(item => totalItems += item.price * item.qtd);

    let discount = 0;
    if(promotionCodes[userCoupon]) discount = (totalItems + deliveryFee) * (promotionCodes[userCoupon]/100);

    const totalPay = totalItems + deliveryFee - discount;

    // Saudação automática
    const hour = new Date().getHours();
    let greeting = 'Boa noite';
    if(hour >= 5 && hour < 12) greeting = 'Bom dia';
    else if(hour >= 12 && hour < 18) greeting = 'Boa tarde';

    const itemsText = cartItems.map(i => `- ${i.qtd} ${i.name}`).join('\n');

    // Montar mensagem condicional
    let message = `${greeting} ${userName},\nGostaria de encomendar:\n${itemsText}\n`;

    if(wantsDelivery){
        message += `Endereço de entrega: ${deliveryAddress || 'Não informado'}\n`;
    }

    if(paymentMethod) message += `Forma de pagamento: ${paymentMethod}\n`;

    message += `Total a pagar: R$ ${totalPay.toFixed(2)}`;

    if(discount > 0) message += `\nEstou utilizando o cupom: ${userCoupon}.`;

    // Abrir WhatsApp
    const whatsappNumber = '5513982156120'; // Substitua pelo número da lanchonete
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
};

// -----------------------------
// BOTÃO GERAR PEDIDO
// -----------------------------
const wantDeliveryBtn = document.getElementById('wantDelivery');
const dontWantDeliveryBtn = document.getElementById('dontWantDelivery');

wantDeliveryBtn.addEventListener('click', () => {
    document.getElementById('deliveryAddressDiv').style.display = 'block';
    wantDeliveryBtn.classList.add('active');
    dontWantDeliveryBtn.classList.remove('active');
});

dontWantDeliveryBtn.addEventListener('click', () => {
    document.getElementById('deliveryAddressDiv').style.display = 'none';
    dontWantDeliveryBtn.classList.add('active');
    wantDeliveryBtn.classList.remove('active');
});

document.getElementById('generateOrder').addEventListener('click', () => {
    const userName = document.getElementById('userName').value.trim() || 'Cliente';
    const wantsDelivery = wantDeliveryBtn.classList.contains('active');
    const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
    const userCoupon = document.getElementById('promotionCode').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;

    generateOrder(userName, userCoupon, wantsDelivery, deliveryAddress, paymentMethod);
});
