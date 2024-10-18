console.log("data");

class Pokemons {
  constructor() {
    this.pokeApi = "https://pokeapi.co/api/v2/";
    this.pokemons = [];
    this.data = this.getData(`${this.pokeApi}pokemon?limit=100&offset=20"`)
      .then((data) => this.getPokemons(data))
      .then((data) => eccomerce(data));
    // this.pokemons = this.getPokemons(this.data)
  }
  async getData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
  async getPokemons(apiData) {
    const data = [];
    for (const item of apiData.results) {
      const res = await fetch(item.url);
      const itemData = await res.json();
      data.push(itemData);
    }
    return data;
  }
}
new Pokemons();

class Eccomerce {
  constructor(data = []) {
    this.pokemonsData = data;
    this.pokemonsTypes = [];
    this.selectedCheckboxs = [];
    this.selectedPriceRange = 0;
    this.maxPrice = 0;
    this.minPrice = 0;
    this.pokemonsOriginalData = this.pokemonsData;
    this.checkboxes = [];
    this.cart = {};
    // elements

    this.cartElement = null;
    this.closeCart = null;
    this.cartBg = null;
    this.cartTab = null;
    this.restBtn = [];
    this.addBtn = [];
    this.quantityBox = null;
    this.deleteBtnsElements = [];
    this.emptyCart = null;
    this.cartCounter = null;
    //functions
    this.getHTMLElements();
    this.getPokemonsTypes();
    this.createRangeFilter();
    this.createCards();
    this.createCheckboxs();
    this.filterCheckbox();
    this.filterToogle();
    this.cartToggle();
  }
  getHTMLElements() {
    this.cartElement = document.getElementById("cart");
    this.closeCart = document.getElementById("close-cart");
    this.cartBg = document.querySelector(".cart-bg");
    this.cartTab = document.querySelector(".cart");
    this.emptyCart = document.querySelector(".cart__empty");
    this.cartCounter = document.getElementById("cart-counter");
    // console.log( this.cartElement, this.closeCart, this.addToCartBtnscartBg, this.cartTab)
  }
  createCards(pokemonsData = this.pokemonsData) {
    const products = document.querySelector(".products");
    let cards = "";
    let pokemonTypes = "";
    pokemonsData.forEach((item) => {
      item.types.forEach(
        (item) =>
          (pokemonTypes += `<span class="card__footer__info-types__kind${
            item.type.name ? "--" + item.type.name : ""
          }">${item.type.name}</span>`)
      );
      cards += `<article class="card">
                <figure class="card__image">
                    <img src=${
                      item.sprites.other["official-artwork"].front_default
                    } alt=${item.name}>
                </figure>
                <div class="card__info">
                  <p class="card__name">${item.name}</p>
                  <strong class="card__price"><span class="material-symbols-outlined">sell</span>$${item.base_experience.toFixed(
                    2
                  )}</strong>
                </div>
                <div class="card__footer">
                <small class="card__footer__info-types"> Pokemon type: ${pokemonTypes}</small>
                <button class="card__footer__add-btn" item-id=${item.id}>
                  <span item-id=${item.id} class="material-symbols-outlined">
                  add_shopping_cart
                  </span>
                </button>
                </div>
            </article>`;
      pokemonTypes = "";
    });
    products.innerHTML = "";
    products.innerHTML = cards;
    this.addToCartBtns();
  }
  getPokemonsTypes() {
    for (const item of this.pokemonsData) {
      for (const type of item.types) {
        const typeExist = this.pokemonsTypes.find(
          (item) => item === type.type.name
        );
        if (!typeExist) {
          this.pokemonsTypes.push(type.type.name);
        }
      }
    }
  }
  createCheckboxs() {
    const filters = document.querySelector(".filters > ul");
    let checkboxes = "";
    this.pokemonsTypes.forEach((type) => {
      checkboxes += ` <li><input type="checkbox" value=${type}>${type}</li>`;
    });
    filters.innerHTML = "";
    filters.innerHTML = checkboxes;
  }
  filterCheckbox() {
    this.checkboxes = document.querySelectorAll("input[type=checkbox]");
    console.log(this.checkboxes);
    this.checkboxes.forEach((checkbox) =>
      checkbox.addEventListener("click", (e) => {
        this.pokemonsData = this.pokemonsOriginalData;
        this.selectedPriceRange = this.maxPrice;
        this.createRangeFilter();
        this.selectedCheckboxs = [];
        const filters = Object.values(this.checkboxes)
          .filter((item) => item.checked)
          .map((i) => i.value);
        for (const pokemon of this.pokemonsData) {
          for (const type of pokemon.types) {
            for (const filter of filters) {
              if (type.type.name === filter) {
                const pokemonExist = this.selectedCheckboxs.find(
                  (item) => item.name === pokemon.name
                );
                if (!pokemonExist) {
                  this.selectedCheckboxs.push(pokemon);
                }
              }
            }
          }
        }
        if (this.selectedCheckboxs.length > 0) {
          this.pokemonsData = this.selectedCheckboxs;
        }
        this.createCards();
      })
    );
  }
  createRangeFilter() {
    const priceRange = document.getElementById("price-range");
    const pokemonsData = [...this.pokemonsData];
    const sortedByPrice = pokemonsData.sort(
      (a, b) => a.base_experience - b.base_experience
    );
    console.log({ sortedByPrice });
    this.minPrice = sortedByPrice[0].base_experience;
    this.maxPrice = sortedByPrice[sortedByPrice.length - 1].base_experience;
    this.selectedPriceRange = this.maxPrice;
    const rangeElement = `<small>$${this.minPrice}</small>
      <input type="range" id="price" name="price" value=${this.maxPrice} min=${
      this.minPrice + 2
    } max=${this.maxPrice + 3}>
    <small id="max-price">$${this.maxPrice}</small>`;
    priceRange.innerHTML = rangeElement;
    this.filterByRange();
  }
  filterByRange() {
    const ranageFilter = document.getElementById("price-range");
    const maxPrice = document.getElementById("max-price");
    ranageFilter.addEventListener("change", (e) => {
      this.checkboxes.forEach((item) => (item.checked = false));
      this.pokemonsData = this.pokemonsOriginalData;
      this.selectedPriceRange = e.target.value;
      maxPrice.innerText = "$" + this.selectedPriceRange;
      this.pokemonsData = this.pokemonsData.filter(
        (pokemon) => pokemon.base_experience <= this.selectedPriceRange
      );
      this.createCards();
    });
  }
  filterToogle() {
    const layout = document.querySelector(".layout");
    const closeBtn = document.getElementById("close-filters");
    const closeFilter = document.querySelector("button > [data-filter=close]");
    const showFilter = document.querySelector("button > [data-filter=show]");
    closeBtn.addEventListener("click", () => {
      layout.classList.toggle("hide-filters");
      if (layout.classList.contains("hide-filters")) {
        showFilter.classList.remove("hide-icon");
        closeFilter.classList.add("hide-icon");
      } else {
        showFilter.classList.add("hide-icon");
        closeFilter.classList.remove("hide-icon");
      }
    });
  }
  closeOpenCart() {
    this.cartBg.classList.toggle("show-cart-bg");
    this.cartTab.classList.toggle("show-cart");
  }
  cartToggle() {
    const toogle = (element) => {
      element.addEventListener("click", () => {
        this.closeOpenCart();
      });
    };
    toogle(this.cartElement);
    toogle(this.closeCart);
  }
  showEmptyCart() {
    this.emptyCart.classList.remove("hide_empty");
  }
  removeEmptyCart() {
    this.emptyCart.classList.add("hide_empty");
  }
  addToCartBtns() {
    const addBtn = document.querySelectorAll(".card__footer__add-btn");
    addBtn.forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.getAttribute(["item-id"]));
        const pokemon = Object.values(this.pokemonsOriginalData).find(
          (pokemon) => pokemon.id === id
        );
        if (!this.cart[id]) {
          const item = { [id]: { pokemon, quantity: 1 } };
          this.cart = { ...this.cart, ...item };
        } else {
          this.cart[id] = {
            ...this.cart[id],
            quantity: this.cart[id].quantity + 1,
          };
        }
        this.createCartItems();
        this.closeOpenCart();
        this.removeEmptyCart();
        this.updateTotalAccount();
        this.updateCartCounter();
      })
    );
  }
  createCartItems() {
    const cartProductsSection = document.getElementById("cart-products");
    let item = "";

    Object.values(this.cart).forEach((cartItem) => {
      item += `<article class="cart__products__item">
         <figure class="cart__products__item__img">
           <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
             cartItem.pokemon.id
           }.png" alt="pokemon name">
         </figure>
         <div class="cart__products__item__info">
           <p>${cartItem.pokemon.name}</p>
             <div class="cart__products__item__info__form" id=${
               "info-" + cartItem.pokemon.id
             }>
                 <button data-restid=${
                   cartItem.pokemon.id
                 } class="material-symbols-outlined" >
                     remove
                 </button>
                 <input data-value=${
                   cartItem.pokemon.id
                 } class="quantity-box" value=${
        cartItem.quantity
      } type="number" />
                 <button data-addid=${
                   cartItem.pokemon.id
                 } class="material-symbols-outlined" >
                     add
                 </button>
                 <button data-delete=${
                   cartItem.pokemon.id
                 } class="material-symbols-outlined delete-cart" >delete</button>
             </div>
           <strong id=${"total-" + cartItem.pokemon.id}><span>total: </span>$${
        (cartItem.pokemon.base_experience * cartItem.quantity).toFixed(2)
      }</strong>
         </div>
       </article>`;
    });
    cartProductsSection.innerHTML = item;
    this.restQuantity();
    this.addQuantity();
    this.QuantityInput();
    this.deleteBtns();
  }
  deleteCartItem(id) {
    delete this.cart[id];
    this.createCartItems();
    if (Object.values(this.cart).length === 0) {
      this.closeOpenCart();
      this.showEmptyCart();
      this.updateTotalAccount();
      this.updateCartCounter();
    }
  }
  updateAmount(id) {
    if (id) {
      const amount = document.getElementById(`total-${id}`);
      amount.innerHTML = `<span>total: </span>$${
        (this.cart[id].pokemon.base_experience * this.cart[id].quantity).toFixed(2)
      }`;
    }
  }
  restQuantity() {
    this.restBtn = document.querySelectorAll("[data-restid]");
    console.log(this.restBtn);
    Object.values(this.restBtn).forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-restid");
        const quantityBox = document.querySelector(
          `#info-${id} > .quantity-box`
        );
        if (this.cart[id] && this.cart[id].quantity > 0) {
          this.cart[id] = {
            ...this.cart[id],
            quantity: this.cart[id].quantity - 1,
          };
          quantityBox.value = this.cart[id].quantity;
          if (this.cart[id].quantity === 0) {
            this.deleteCartItem(id);
          }
          this.updateAmount(id);
          this.updateTotalAccount();
          this.updateCartCounter();
        }
      })
    );
  }
  deleteBtns() {
    this.deleteBtnsElements = document.querySelectorAll(".delete-cart");
    console.log(this.deleteBtnsElements);
    Object.values(this.deleteBtnsElements).forEach((deleteBtn) =>
      deleteBtn.addEventListener("click", () => {
        console.log(deleteBtn);
        const id = deleteBtn.getAttribute("data-delete");
        this.deleteCartItem(id);
      })
    );
  }
  updateCartCounter() {
    if (Object.values(this.cart).length > 0) {
      this.cartCounter.innerText = `${Object.values(this.cart).reduce(
        (prev, current) => current.quantity + prev,
        0
      )}`;
      this.cartCounter.classList.remove("hide-counter");
    } else {
      this.cartCounter.classList.add("hide-counter");
    }
  }
  updateTotalAccount() {
    const totalAccount = document.querySelector(".cart__payment > strong");
    const totalAccountContainer = document.querySelector(".cart__payment");
    if (Object.values(this.cart).length === 0) {
      totalAccountContainer.classList.add("hide_account");
    } else {
      totalAccountContainer.classList.remove("hide_account");
    }
    const amount = Object.values(this.cart).reduce(
      (prev, current) =>
        current.pokemon.base_experience * current.quantity + prev,
      0
    );
    totalAccount.innerHTML = `Total to pay: $${amount.toFixed(2)}`;
  }
  QuantityInput() {
    this.quantityBox = document.querySelectorAll(".quantity-box");
    Object.values(this.quantityBox).forEach((input) =>
      input.addEventListener("change", (e) => {
        const id = input.getAttribute("data-value");
        console.log(id, input.value);
        if (this.cart[id]) {
          this.cart[id] = { ...this.cart[id], quantity: parseInt(input.value) };
          if (this.cart[id].quantity === 0) {
            this.deleteCartItem(id);
          }
          this.updateAmount(id);
          this.updateTotalAccount();
          this.updateCartCounter();
        }
      })
    );
  }
  addQuantity() {
    this.addBtn = document.querySelectorAll("[data-addid]");
    console.log(this.addBtn);
    Object.values(this.addBtn).forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-addid");
        const quantityBox = document.querySelector(
          `#info-${id} > .quantity-box`
        );
        console.log({ quantityBox });
        if (this.cart[id]) {
          this.cart[id] = {
            ...this.cart[id],
            quantity: this.cart[id].quantity + 1,
          };
          quantityBox.value = this.cart[id].quantity;
          this.updateAmount(id);
          this.updateTotalAccount();
          this.updateCartCounter();
        }
      })
    );
  }
}

const eccomerce = (data) => {
  return new Eccomerce(data);
};
