// Wishlist functionality for Shopify store
class Wishlist {
  constructor() {
    this.storageKey = 'shop_wishlist';
    this.wishlistItems = this.getWishlistItems() || [];
    this.selectors = {
      wishlistBtn: '.wishlist-btn',
      wishlistCount: '[data-wishlist-count]',
      wishlistCountBubble: '[data-wishlist-count-bubble]',
      wishlistToggle: '.site-header__wishlist',
      wishlistDrawer: '#WishlistDrawer',
      wishlistClose: '.wishlist-drawer__close',
      wishlistContainer: '.wishlist-drawer__container',
      wishlistOverlay: '.wishlist-drawer-overlay'
    };
    
    this.init();
  }
  
  init() {
    // Certifique-se que a inicialização ocorre após o DOM estar completamente carregado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.updateWishlistCount();
        this.bindEvents();
        this.markActiveWishlistItems();
        this.setupWishlistDrawer();
      });
    } else {
      this.updateWishlistCount();
      this.bindEvents();
      this.markActiveWishlistItems();
      this.setupWishlistDrawer();
    }
  }
  
  bindEvents() {
    const wishlistButtons = document.querySelectorAll(this.selectors.wishlistBtn);
    wishlistButtons.forEach(button => {
      button.addEventListener('click', this.toggleWishlistItem.bind(this));
    });
    
    const wishlistToggle = document.querySelector(this.selectors.wishlistToggle);
    if (wishlistToggle) {
      wishlistToggle.addEventListener('click', this.toggleWishlistDrawer.bind(this));
    }
    
    const wishlistClose = document.querySelector(this.selectors.wishlistClose);
    if (wishlistClose) {
      wishlistClose.addEventListener('click', this.closeWishlistDrawer.bind(this));
    }
    
    const wishlistOverlay = document.querySelector(this.selectors.wishlistOverlay);
    if (wishlistOverlay) {
      wishlistOverlay.addEventListener('click', this.closeWishlistDrawer.bind(this));
    }
    
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        this.closeWishlistDrawer();
      }
    });
  }
  
  toggleWishlistItem(event) {
    const button = event.currentTarget;
    const productId = button.dataset.productId;
    const productHandle = button.dataset.productHandle;
    
    if (!productId || !productHandle) return;
    
    const index = this.wishlistItems.findIndex(item => item.id === productId);
    
    if (index > -1) {
      // Remove from wishlist
      this.wishlistItems.splice(index, 1);
      button.classList.remove('is-active');
      
      // Disparar evento para análise e feedback visual
      document.dispatchEvent(new CustomEvent('product:removed-from-wishlist', {
        detail: { id: productId, handle: productHandle }
      }));
    } else {
      // Add to wishlist
      this.wishlistItems.push({
        id: productId,
        handle: productHandle
      });
      button.classList.add('is-active');
      
      // Disparar evento para análise e feedback visual
      document.dispatchEvent(new CustomEvent('product:added-to-wishlist', {
        detail: { id: productId, handle: productHandle }
      }));
    }
    
    this.saveWishlistItems();
    this.updateWishlistCount();
    this.updateWishlistDrawer();
  }
  
  markActiveWishlistItems() {
    const wishlistButtons = document.querySelectorAll(this.selectors.wishlistBtn);
    
    wishlistButtons.forEach(button => {
      const productId = button.dataset.productId;
      
      if (productId && this.isInWishlist(productId)) {
        button.classList.add('is-active');
      }
    });
  }
  
  isInWishlist(productId) {
    return this.wishlistItems.some(item => item.id === productId);
  }
  
  getWishlistItems() {
    const items = localStorage.getItem(this.storageKey);
    return items ? JSON.parse(items) : [];
  }
  
  saveWishlistItems() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.wishlistItems));
  }
  
  updateWishlistCount() {
    const count = this.wishlistItems.length;
    const wishlistCount = document.querySelector(this.selectors.wishlistCount);
    const wishlistCountBubble = document.querySelector(this.selectors.wishlistCountBubble);
    
    if (wishlistCount) {
      wishlistCount.textContent = count;
      wishlistCount.style.display = count > 0 ? 'flex' : 'none';
      console.log('Wishlist count atualizado:', count, wishlistCount);
    } else {
      console.log('Elemento do contador de wishlist não encontrado');
    }
    
    if (wishlistCountBubble) {
      if (count > 0) {
        wishlistCountBubble.classList.remove('hide');
      } else {
        wishlistCountBubble.classList.add('hide');
      }
    }
  }
  
  setupWishlistDrawer() {
    // Criar o drawer se ainda não existir
    if (!document.querySelector(this.selectors.wishlistDrawer)) {
      this.createWishlistDrawer();
    }
    
    this.updateWishlistDrawer();
  }
  
  createWishlistDrawer() {
    const drawerHtml = `
      <div class="wishlist-drawer-overlay"></div>
      <div id="WishlistDrawer" class="wishlist-drawer">
        <div class="wishlist-drawer__header">
          <h2 class="wishlist-drawer__title">My Wishlist</h2>
          <button class="wishlist-drawer__close" aria-label="Fechar">
            <svg aria-hidden="true" focusable="false" role="presentation" width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 1.6L13.4 0 8 5.4 2.6 0 1 1.6 6.4 7 1 12.4 2.6 14 8 8.6 13.4 14 15 12.4 9.6 7z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div class="wishlist-drawer__container"></div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
    
    // Re-atribuir os event listeners após criar o drawer
    const wishlistClose = document.querySelector(this.selectors.wishlistClose);
    const wishlistOverlay = document.querySelector(this.selectors.wishlistOverlay);
    
    if (wishlistClose) {
      wishlistClose.addEventListener('click', this.closeWishlistDrawer.bind(this));
    }
    
    if (wishlistOverlay) {
      wishlistOverlay.addEventListener('click', this.closeWishlistDrawer.bind(this));
    }
  }
  
  updateWishlistDrawer() {
    const container = document.querySelector(this.selectors.wishlistContainer);
    if (!container) return;
    
    if (this.wishlistItems.length === 0) {
      container.innerHTML = `
        <div class="wishlist-empty">
          <h2>Sua lista de desejos está vazia</h2>
          <p>Adicione itens à sua lista de desejos clicando no ícone de coração em qualquer produto.</p>
          <a href="/collections/all" class="btn">Continuar Comprando</a>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `<div class="wishlist-drawer__products"></div>`;
    const productsContainer = container.querySelector('.wishlist-drawer__products');
    
    // Buscar os detalhes de cada produto na wishlist
    this.wishlistItems.forEach(item => {
      this.fetchProductDetails(item.handle)
        .then(product => {
          const productHtml = this.createProductHtml(product, item.id);
          productsContainer.insertAdjacentHTML('beforeend', productHtml);
          
          // Adicionar evento para remover da wishlist
          const removeButton = productsContainer.querySelector(`.wishlist-drawer__product[data-product-id="${item.id}"] .wishlist-drawer__product-remove`);
          if (removeButton) {
            removeButton.addEventListener('click', this.removeWishlistItem.bind(this));
          }
        })
        .catch(error => console.error('Erro ao buscar detalhes do produto:', error));
    });
  }
  
  fetchProductDetails(handle) {
    return fetch(`/products/${handle}.js`)
      .then(response => response.json());
  }
  
  createProductHtml(product, productId) {
    const variant = product.variants[0];
    const comparePrice = variant.compare_at_price ? `<span class="wishlist-drawer__product-price--compare">${this.formatMoney(variant.compare_at_price)}</span>` : '';
    const saleClass = variant.compare_at_price && variant.compare_at_price > variant.price ? 'wishlist-drawer__product-price--sale' : '';
    
    return `
      <div class="wishlist-drawer__product" data-product-id="${productId}">
        <button class="wishlist-drawer__product-remove" data-product-id="${productId}" aria-label="Remover da lista de desejos">×</button>
        <div class="wishlist-drawer__product-image">
          <a href="/products/${product.handle}">
            <img src="${product.featured_image}" alt="${product.title}" width="100%" height="auto">
          </a>
        </div>
        <div class="wishlist-drawer__product-content">
          <div class="wishlist-drawer__product-info">
            <h3 class="wishlist-drawer__product-title">${product.title}</h3>
            <div class="wishlist-drawer__product-price ${saleClass}">
              ${this.formatMoney(variant.price)} ${comparePrice}
            </div>
          </div>
          <form action="/cart/add" method="post" class="wishlist-drawer__product-form">
            <input type="hidden" name="id" value="${variant.id}">
            <input type="hidden" name="quantity" value="1">
            <button type="submit" class="btn btn--small wishlist-drawer__product-add" ${!variant.available ? 'disabled' : ''}>
              ${variant.available ? 'Add to Bag' : 'Sold Out'}
            </button>
          </form>
        </div>
      </div>
    `;
  }
  
  removeWishlistItem(event) {
    const productId = event.currentTarget.dataset.productId;
    
    if (!productId) return;
    
    const index = this.wishlistItems.findIndex(item => item.id === productId);
    
    if (index > -1) {
      this.wishlistItems.splice(index, 1);
      this.saveWishlistItems();
      this.updateWishlistCount();
      this.updateWishlistDrawer();
      this.markActiveWishlistItems();
      
      // Disparar evento para análise e feedback visual
      const product = this.wishlistItems.find(item => item.id === productId);
      if (product) {
        document.dispatchEvent(new CustomEvent('product:removed-from-wishlist', {
          detail: { id: product.id, handle: product.handle }
        }));
      }
    }
  }
  
  toggleWishlistDrawer() {
    const drawer = document.querySelector(this.selectors.wishlistDrawer);
    const overlay = document.querySelector(this.selectors.wishlistOverlay);
    
    if (!drawer || !overlay) return;
    
    if (drawer.classList.contains('is-open')) {
      this.closeWishlistDrawer();
    } else {
      drawer.classList.add('is-open');
      overlay.classList.add('is-visible');
      document.body.classList.add('wishlist-drawer-open');
    }
  }
  
  closeWishlistDrawer() {
    const drawer = document.querySelector(this.selectors.wishlistDrawer);
    const overlay = document.querySelector(this.selectors.wishlistOverlay);
    
    if (!drawer || !overlay) return;
    
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.classList.remove('wishlist-drawer-open');
  }
  
  formatMoney(cents) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    
    let value = '';
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatString = theme.moneyFormat || "R$ {{amount}}";
    
    function formatWithDelimiters(number, precision, thousands, decimal) {
      thousands = thousands || '.';
      decimal = decimal || ',';
      
      if (isNaN(number) || number === null) {
        return 0;
      }
      
      number = (number / 100.0).toFixed(precision);
      
      const parts = number.split('.');
      const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      const centsAmount = parts[1] ? (decimal + parts[1]) : '';
      
      return dollarsAmount + centsAmount;
    }
    
    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', ',');
        break;
    }
    
    return formatString.replace(placeholderRegex, value);
  }
}

// Inicializar a classe Wishlist quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.wishlist = new Wishlist();
  
  // Adicionar estilos para o novo layout
  const style = document.createElement('style');
  style.textContent = `
    .wishlist-drawer {
      position: fixed;
      top: 0;
      right: -450px;
      width: 450px;
      max-width: 100%;
      height: 100%;
      background-color: #fff;
      z-index: 1001;
      overflow-y: auto;
      transition: right 0.3s ease-in-out;
      box-shadow: -2px 0 5px rgba(0,0,0,0.2);
    }
    
    .wishlist-drawer.is-open {
      right: 0;
    }
    
    .wishlist-drawer__products {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      padding: 15px;
    }
    
    .wishlist-drawer__product {
      display: flex;
      flex-direction: column;
      margin-bottom: 0;
      position: relative;
      border: 1px solid black;
      border-radius: 5px;
      overflow: hidden;
      height: 100%;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .wishlist-drawer__product:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .wishlist-drawer__product-image {
      width: 100%;
      height: auto;
      margin-bottom: 0;
      overflow: hidden;
      border-bottom: 1px solid #d6d6d6;
    }
    
    .wishlist-drawer__product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }
    
    .wishlist-drawer__product:hover .wishlist-drawer__product-image img {
      transform: scale(1.05);
    }
    
    .wishlist-drawer__product-content {
      padding: 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    
    .wishlist-drawer__product-info {
      text-align: start;
      flex-grow: 1;
      margin-bottom: 10px;
    }
    
    .wishlist-drawer__product-remove {
      position: absolute;
      top: -2px;
      right: 5px;
      z-index: 5;
      background: rgba(255,255,255,0.7);
      border-radius: 50%;
      width: 26px;
      height: 26px;
      line-height: 22px;
      text-align: center;
      border: none;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    
    .wishlist-drawer__product-remove:hover {
      background: rgba(255,255,255,0.9);
      transform: scale(1.1);
    }
    
    .wishlist-drawer__product-title {
      margin-bottom: 5px;
      font-size: 14px;
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .wishlist-drawer__product-price {
      margin-bottom: 10px;
    }
    
    .wishlist-drawer__product-form {
      margin-top: auto;
    }
    
    .wishlist-drawer__product-add {
      width: 100%;
      margin: 0;
      padding: 8px 12px;
      font-size: 13px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      border-radius: 5px;
      text-transform: capitalize;
    }
    
    @media screen and (max-width: 480px) {
      .wishlist-drawer__products {
        grid-template-columns: 1fr;
      }
      
      .wishlist-drawer {
        width: 100%;
        right: -100%;
      }
    }
  `;
  document.head.appendChild(style);
});