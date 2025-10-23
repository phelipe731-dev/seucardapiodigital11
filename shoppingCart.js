// ELEMENTOS DO HTML
const showItems = document.querySelector('#showItems');
const showAllItemsValue = document.querySelector('#showAllItemsValue');
const showDelivery = document.querySelector('#showDelivery');
const showDiscount = document.querySelector('#showDiscount');
const showTotal = document.querySelector('#showTotal');
const inputPromotionCode = document.querySelector('#promotionCode');
const btnAddPromotionCode = document.querySelector('#addPromotionCode');
const btnWantDelivery = document.querySelector('#wantDelivery');
const btnDontWantDelivery = document.querySelector('#dontWantDelivery');
const btnGenerateOrder = document.querySelector('#generateOrder');
const deliveryAddressDiv = document.getElementById('deliveryAddressDiv');
const deliveryAddressInput = document.getElementById('deliveryAddress');
const paymentMethodInput = document.getElementById('paymentMethod');
const userNameInput = document.getElementById('userName');

// MODAL DE CONFIRMAÇÃO ESTILIZADO
const orderConfirmationModal = document.createElement('div');
orderConfirmationModal.id = 'orderConfirmationModal';
orderConfirmationModal.style.display = 'none';
orderConfirmationModal.style.position = 'fixed';
orderConfirmationModal.style.top = '0';
orderConfirmationModal.style.left = '0';
orderConfirmationModal.style.width = '100%';
orderConfirmationModal.style.height = '100%';
orderConfirmationModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
orderConfirmationModal.style.display = 'flex';
orderConfirmationModal.style.alignItems = 'center';
orderConfirmationModal.style.justifyContent = 'center';
orderConfirmationModal.style.zIndex = '9999';
orderConfirmationModal.innerHTML = `
  <div style="
      background:#fff; 
      padding:25px; 
      border-radius:15px; 
      max-width:450px; 
      width:90%; 
      font-family: 'Montserrat', sans-serif; 
      color:#333;
      box-shadow: 0 5px 25px rgba(0,0,0,0.3);
      text-align:left;
  ">
    <h2 style="margin-bottom:15px; color:#FF7F0A;">Confirme seu pedido</h2>
    <div id="orderSummary" style="white-space:pre-wrap; margin-bottom:20px; font-size:16px; line-height:1.5;"></div>
    <div style="text-align:right;">
      <button id="cancelOrderBtn" style="
          background:#eee; 
          color:#333; 
          border:none; 
          padding:10px 15px; 
          border-radius:8px; 
          margin-right:10px; 
          cursor:pointer;
          font-weight:500;
      ">Cancelar</button>
      <button id="confirmOrderBtn" style="
          background:#FF7F0A; 
          color:#fff; 
          border:none; 
          padding:10px 15px; 
          border-radius:8px; 
          cursor:pointer;
          font-weight:600;
      ">Confirmar</button>
    </div>
  </div>
`;
document.body.appendChild(orderConfirmationModal);

const orderSummaryDiv = document.getElementById('orderSummary');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');

// GET & SET CART
const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];
const setCart = cartData => localStorage.setItem('cart', JSON.stringify(cartData));

// NOTIFICAÇÕES
const toast = (text) => Toastify({text,duration:5000,newWindow:true,close:true,gravity:"bottom",position:"right",stopOnFocus:true,style:{background:"#FF7F0A",boxShadow:"0 0 160px 0 #0008"}}).showToast();
const itemRemovedNotification = () => toast("Produto removido do carrinho de compras.");
const appliedCode = () => toast("Cupom aplicado com sucesso!");
const codeNotFound = () => toast("Cupom não encontrado!");
const noItemsInCart = () => toast("Não é possível gerar pedido sem ter item no carrinho.");

// CUPONS
const promotionCodes = { easteregg:15, blackfriday:20, summer2025:15 };

// VARIÁVEIS
let cartItemsData = [];
let allItemsValue = 0;
let deliveryValue = 0;
let discountValue = 0;

// GERAR CARRINHO
const generateCart = () => {
    const cartData = getCart();
    cartItemsData = [];
    allItemsValue = 0;
    cartData.forEach(prod => {
        const item = products.find(p => p.id === prod.id);
        if(item){ item.qtd = prod.qtd; allItemsValue += item.price*item.qtd; cartItemsData.push(item); }
    });
    return cartItemsData;
};

// EXIBIR ITENS NO HTML
const addItemToItemsToShow = prod => {
    const price = (prod.price*prod.qtd).toFixed(2).replace('.',',');
    showItems.innerHTML += `<div class="item"><img src="../img/${prod.img}" alt="Imagem de ${prod.name}"><div><p class="title">${prod.name}</p><p>${prod.description}</p><div class="bottom"><div class="counter"><button onclick="remItem(${prod.id})">-</button><input type="text" value="${prod.qtd}" disabled><button onclick="addItem(${prod.id})">+</button></div><p class="price">R$ <span>${price}</span></p></div></div></div><hr>`;
};

// ADD / REMOVER ITENS
const addItem = id => { const cart = getCart().map(item=>item.id===id?{...item,qtd:item.qtd+1}:item); setCart(cart); init(); };
const remItem = id => { const cart = getCart().map(item=>{ if(item.id===id&&item.qtd>1) return {...item,qtd:item.qtd-1}; if(item.id===id&&item.qtd<=1){ itemRemovedNotification(); return null; } return item; }).filter(Boolean); setCart(cart); init(); };

// ESCOLHER DELIVERY
const chooseDelivery = option => {
    if(option){ btnWantDelivery.classList.add('active'); btnDontWantDelivery.classList.remove('active'); deliveryAddressDiv.style.display='block'; deliveryValue=3; }
    else{ btnDontWantDelivery.classList.add('active'); btnWantDelivery.classList.remove('active'); deliveryAddressDiv.style.display='none'; deliveryValue=0; }
    init();
};

// CUPOM
const addDiscount = () => {
    const code = inputPromotionCode.value.trim().toLowerCase();
    if(promotionCodes[code]){ discountValue = promotionCodes[code]; appliedCode(); init(); } else codeNotFound();
};

// EXIBIR TOTAL NO HTML
const showOnPage = () => {
    showItems.innerHTML='';
    if(cartItemsData.length>0){ cartItemsData.forEach(item=>addItemToItemsToShow(item)); } 
    else showItems.innerHTML='<p>Você ainda não adicionou itens no carrinho.</p>';
    const totalValue = allItemsValue+deliveryValue;
    showAllItemsValue.innerHTML='R$ '+allItemsValue.toFixed(2).replace('.',',');
    showDelivery.innerHTML='+ R$ '+deliveryValue.toFixed(2).replace('.',',');
    showDiscount.innerHTML='- R$ '+((totalValue*discountValue)/100).toFixed(2).replace('.',',');
    showTotal.innerHTML='R$ '+(totalValue-((totalValue*discountValue)/100)).toFixed(2).replace('.',',');
};

// INIT
const init = () => { generateCart(); showOnPage(); };
init();

// MOSTRAR MODAL DE CONFIRMAÇÃO
const showConfirmation = () => {
    if(cartItemsData.length===0){ noItemsInCart(); return; }

    const userName = userNameInput?.value.trim() || 'Cliente';
    const wantsDelivery = btnWantDelivery.classList.contains('active');
    const deliveryAddress = deliveryAddressInput?.value.trim() || '';
    const paymentMethod = paymentMethodInput?.value || '';
    const userCoupon = inputPromotionCode.value.trim().toLowerCase();

    let totalItems = 0; 
    cartItemsData.forEach(item => totalItems += item.price * item.qtd);
    let discount = promotionCodes[userCoupon] ? (totalItems + deliveryValue) * (promotionCodes[userCoupon]/100) : 0;
    const totalPay = totalItems + deliveryValue - discount;

    // Montar resumo
    let summary = `*Olá! Esse é meu pedido*\n\n`;
    summary += `Meu nome é *${userName}*\n\n`;
    summary += `Gostaria de encomendar:\n`;
    cartItemsData.forEach(item => summary += `- ${item.qtd} ${item.name}\n`);
    if(wantsDelivery) summary += `\n*Endereço de entrega*: ${deliveryAddress || 'não informado'}\n`;
    if(paymentMethod) summary += `*Forma de pagamento:* ${paymentMethod}\n`;
    if(discount>0) summary += `Estou utilizando o cupom: ${userCoupon}.\n`;
    summary += `*Total a pagar:* R$ ${totalPay.toFixed(2)}`;

    orderSummaryDiv.innerText = summary;
    orderConfirmationModal.style.display = 'flex';
};

// CONFIRMAR / CANCELAR PEDIDO
confirmOrderBtn.addEventListener('click', () => {
    orderConfirmationModal.style.display = 'none';
    generateOrder(); // abre WhatsApp
});
cancelOrderBtn.addEventListener('click', () => orderConfirmationModal.style.display = 'none');

// GERAR PEDIDO WHATSAPP
const generateOrder = () => {
    const userName = userNameInput?.value.trim() || 'Cliente';
    const wantsDelivery = btnWantDelivery.classList.contains('active');
    const deliveryAddress = deliveryAddressInput?.value.trim() || '';
    const paymentMethod = paymentMethodInput?.value || '';
    const userCoupon = inputPromotionCode.value.trim().toLowerCase();

    let totalItems = 0; 
    cartItemsData.forEach(item => totalItems += item.price * item.qtd);
    let discount = promotionCodes[userCoupon] ? (totalItems + deliveryValue) * (promotionCodes[userCoupon]/100) : 0;
    const totalPay = totalItems + deliveryValue - discount;

    // Montar mensagem final
    let message = `*Olá! Esse é meu pedido*\n\n`;
    message += `Meu nome é *${userName}*\n\n`;
    message += `Gostaria de encomendar:\n`;
    cartItemsData.forEach(item => message += `- ${item.qtd} ${item.name}\n`);
    if(wantsDelivery) message += `\n*Endereço de entrega*: ${deliveryAddress || 'não informado'}\n`;
    if(paymentMethod) message += `*Forma de pagamento:* ${paymentMethod}\n`;
    if(discount>0) message += `Estou utilizando o cupom: ${userCoupon}.\n`;
    message += `*Total a pagar:* R$ ${totalPay.toFixed(2)}`;

    const whatsappNumber = '5513982156120';
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
};

// EVENT LISTENERS
btnAddPromotionCode.addEventListener('click', addDiscount);
btnWantDelivery.addEventListener('click',()=>chooseDelivery(true));
btnDontWantDelivery.addEventListener('click',()=>chooseDelivery(false));
btnGenerateOrder.addEventListener('click',showConfirmation);
