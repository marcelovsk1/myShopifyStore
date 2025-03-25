// JavaScript para o Menu Off-Canvas
class OffCanvasMenu {
  constructor() {
    this.selectors = {
      menu: '#OffCanvasMenu',
      toggleButton: '.js-off-canvas-toggle',
      closeButton: '.js-off-canvas-close',
      body: 'body'
    };
    
    this.classes = {
      isActive: 'is-active',
      bodyClass: 'off-canvas-menu-open'
    };
    
    this.animation = {
      duration: 500, // Duração da animação em milissegundos
    };
    
    this.init();
  }
  
  init() {
    this.menu = document.querySelector(this.selectors.menu);
    this.toggleButtons = document.querySelectorAll(this.selectors.toggleButton);
    this.closeButtons = document.querySelectorAll(this.selectors.closeButton);
    this.body = document.querySelector(this.selectors.body);
    this.drawer = this.menu ? this.menu.querySelector('.off-canvas-menu__drawer') : null;
    this.isAnimating = false;
    
    if (!this.menu || this.toggleButtons.length === 0) return;
    
    this.bindEvents();
  }
  
  bindEvents() {
    // Adiciona evento para abrir o menu
    this.toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.isAnimating) {
          this.openMenu();
        }
      });
    });
    
    // Adiciona evento para fechar o menu
    this.closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.isAnimating) {
          this.closeMenu();
        }
      });
    });
    
    // Fecha menu com tecla ESC
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape' && !this.isAnimating) {
        this.closeMenu();
      }
    });
    
    // Adiciona evento de clique no overlay para fechar
    if (this.menu) {
      const overlay = this.menu.querySelector('.off-canvas-menu__overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          e.preventDefault();
          if (!this.isAnimating) {
            this.closeMenu();
          }
        });
      }
    }
    
    // Manipula cliques nos links do menu
    const menuLinks = this.menu.querySelectorAll('a');
    menuLinks.forEach(link => {
      // Somente links sem subcategorias devem fechar o menu
      if (!link.querySelector('.off-canvas-menu__icon-right')) {
        link.addEventListener('click', (e) => {
          if (!this.isAnimating) {
            // Permitir que o link funcione, mas fechar o menu depois
            setTimeout(() => {
              this.closeMenu();
            }, 100);
          }
        });
      }
    });
    
    // Adicionar listener para detectar o fim da transição
    if (this.drawer) {
      this.drawer.addEventListener('transitionend', this.handleTransitionEnd.bind(this));
    }
  }
  
  handleTransitionEnd(e) {
    // Verifica se a transição que terminou é a do próprio drawer
    if (e.target === this.drawer && e.propertyName === 'transform') {
      this.isAnimating = false;
    }
  }
  
  openMenu() {
    if (!this.menu) return;
    this.isAnimating = true;
    
    // Prevenir scroll do body
    this.body.classList.add(this.classes.bodyClass);
    
    // Adicionar classe ativa para iniciar animação
    this.menu.classList.add(this.classes.isActive);
    
    // Dispara um evento para informar que o menu foi aberto
    document.dispatchEvent(new CustomEvent('off-canvas-menu:opened'));
  }
  
  closeMenu() {
    if (!this.menu) return;
    this.isAnimating = true;
    
    // Remover classe ativa para iniciar animação de saída
    this.menu.classList.remove(this.classes.isActive);
    
    // Esperar a animação terminar antes de remover a classe do body
    setTimeout(() => {
      if (!this.menu.classList.contains(this.classes.isActive)) {
        this.body.classList.remove(this.classes.bodyClass);
      }
    }, this.animation.duration);
    
    // Dispara um evento para informar que o menu foi fechado
    document.dispatchEvent(new CustomEvent('off-canvas-menu:closed'));
  }
}

// Inicializa o menu off-canvas quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.offCanvasMenu = new OffCanvasMenu();
}); 