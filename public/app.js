
const menuList = document.getElementById('menu-list');
const menuMessage = document.getElementById('menu-message');
const refreshButton = document.getElementById('refresh-menu');
const cartList = document.getElementById('cart-list');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');

let menuItems = [];
const cart = new Map();

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

function formatPrice(value) {
  return currency.format(Number(value) || 0);
}

function getFoodSymbol(item) {
  const name = String(item.item_name || '').toLowerCase();

  if (name.includes('coffee')) return '☕';
  if (name.includes('sandwich')) return '🥪';
  if (name.includes('maggi') || name.includes('noodle')) return '🍜';
  if (name.includes('samosa')) return '🥟';

  return item.is_veg ? '🥗' : '🍽️';
}

async function loadMenu() {
  refreshButton.disabled = true;
  menuMessage.textContent = 'Loading menu...';
  menuList.replaceChildren();

  try {
    const response = await fetch('/api/menu');

    if (!response.ok) {
      throw new Error('The menu API returned an error.');
    }

    menuItems = await response.json();

    if (!Array.isArray(menuItems)) {
      throw new Error('Unexpected menu response.');
    }

    // Remove items from the cart if they are no longer available.
    for (const [itemId, quantity] of cart) {
      const item = menuItems.find(
        menuItem => menuItem.item_id === itemId
      );

      if (!item || Number(item.qty_remaining) <= 0) {
        cart.delete(itemId);
      } else if (quantity > Number(item.qty_remaining)) {
        cart.set(itemId, Number(item.qty_remaining));
      }
    }

    renderMenu();
    renderCart();

    menuMessage.textContent = menuItems.length
      ? `${menuItems.length} menu items available`
      : 'No menu items are available right now.';
  } catch (error) {
    console.error('Unable to load menu:', error);
    menuMessage.textContent =
      'Could not load the menu. Check that the backend server is running.';
  } finally {
    refreshButton.disabled = false;
  }
}

function renderMenu() {
  menuList.replaceChildren();

  for (const item of menuItems) {
    const card = document.createElement('article');
    card.className = 'menu-card';

    const symbol = document.createElement('div');
    symbol.className = 'food-symbol';
    symbol.textContent = getFoodSymbol(item);

    const category = document.createElement('p');
    category.className = 'food-category';
    category.textContent = item.category || 'Menu item';

    const name = document.createElement('h3');
    name.textContent = item.item_name;

    const bottom = document.createElement('div');
    bottom.className = 'card-bottom';

    const details = document.createElement('div');

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = formatPrice(item.price);

    const stock = document.createElement('div');
    stock.className = 'stock';

    const availableStock = Number(item.qty_remaining);
    const inStock = Number.isFinite(availableStock) && availableStock > 0;

    stock.textContent = inStock
      ? `${availableStock} available`
      : 'Out of stock';

    details.append(price, stock);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'add-button';
    button.textContent = 'Add +';
    button.disabled = !inStock;

    button.addEventListener('click', () => {
      const currentQuantity = cart.get(item.item_id) || 0;

      if (currentQuantity >= Number(item.qty_remaining)) {
        return;
      }

      cart.set(item.item_id, currentQuantity + 1);
      renderMenu();
      renderCart();
    });

    bottom.append(details, button);
    card.append(symbol, category, name, bottom);
    menuList.append(card);
  }
}

function renderCart() {
  cartList.replaceChildren();

  let totalQuantity = 0;
  let totalAmount = 0;

  if (cart.size === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'Your selection is empty. Add something from the menu.';
    cartList.append(empty);
  }

  for (const [itemId, quantity] of cart) {
    const item = menuItems.find(
      menuItem => menuItem.item_id === itemId
    );

    if (!item) continue;

    const price = Number(item.price) || 0;
    const subtotal = price * quantity;

    totalQuantity += quantity;
    totalAmount += subtotal;

    const row = document.createElement('div');
    row.className = 'cart-row';

    const details = document.createElement('div');

    const name = document.createElement('div');
    name.className = 'cart-item-name';
    name.textContent = item.item_name;

    const priceText = document.createElement('div');
    priceText.className = 'cart-item-price';
    priceText.textContent =
      `${quantity} × ${formatPrice(price)} = ${formatPrice(subtotal)}`;

    details.append(name, priceText);

    const controls = document.createElement('div');
    controls.className = 'quantity-controls';

    const decrease = document.createElement('button');
    decrease.type = 'button';
    decrease.textContent = '−';
    decrease.setAttribute('aria-label', `Remove one ${item.item_name}`);

    decrease.addEventListener('click', () => {
      if (quantity <= 1) {
        cart.delete(itemId);
      } else {
        cart.set(itemId, quantity - 1);
      }

      renderMenu();
      renderCart();
    });

    const quantityLabel = document.createElement('span');
    quantityLabel.textContent = String(quantity);

    const increase = document.createElement('button');
    increase.type = 'button';
    increase.textContent = '+';
    increase.setAttribute('aria-label', `Add one ${item.item_name}`);
    increase.disabled = quantity >= Number(item.qty_remaining);

    increase.addEventListener('click', () => {
      if (quantity >= Number(item.qty_remaining)) {
        return;
      }

      cart.set(itemId, quantity + 1);
      renderMenu();
      renderCart();
    });

    controls.append(decrease, quantityLabel, increase);
    row.append(details, controls);
    cartList.append(row);
  }

  cartCount.textContent =
    `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`;

  cartTotal.textContent = formatPrice(totalAmount);
}

refreshButton.addEventListener('click', loadMenu);

loadMenu();


const bookingForm = document.getElementById('booking-form');
const studentIdInput = document.getElementById('student-id');
const bookingDateInput = document.getElementById('booking-date');
const pickupSlotSelect = document.getElementById('pickup-slot');
const paymentModeSelect = document.getElementById('payment-mode');
const bookingMessage = document.getElementById('booking-message');
const submitBookingButton = document.getElementById('submit-booking');
const bookingConfirmation = document.getElementById('booking-confirmation');

// Use a local calendar date rather than UTC to avoid date shifts.
function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

bookingDateInput.min = getLocalDateString();
bookingDateInput.value = getLocalDateString();

async function loadPickupSlots() {
  const date = bookingDateInput.value;

  pickupSlotSelect.replaceChildren();

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = date ? 'Loading pickup slots...' : 'Choose a date first';
  pickupSlotSelect.append(placeholder);
  pickupSlotSelect.disabled = true;

  if (!date) return;

  try {
    const response = await fetch(
      `/api/slots?date=${encodeURIComponent(date)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load pickup slots');
    }

    pickupSlotSelect.replaceChildren();

    const firstOption = document.createElement('option');
    firstOption.value = '';
    firstOption.textContent = 'Choose a pickup slot';
    pickupSlotSelect.append(firstOption);

    for (const slot of data.slots) {
      const option = document.createElement('option');
      option.value = slot.slot_id;

      const available = Number(slot.remaining_capacity);
      option.disabled = !Boolean(Number(slot.is_available)) || available <= 0;

      option.textContent =
        `${slot.start_time}–${slot.end_time} · ${available} places left`;

      pickupSlotSelect.append(option);
    }

    pickupSlotSelect.disabled = false;
  } catch (error) {
    console.error('Unable to load pickup slots:', error);
    pickupSlotSelect.replaceChildren();

    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Could not load slots — try again';
    pickupSlotSelect.append(option);

    bookingMessage.textContent = error.message;
    bookingMessage.className = 'message error';
  }
}

bookingDateInput.addEventListener('change', () => {
  bookingMessage.textContent = '';
  bookingMessage.className = 'message';
  loadPickupSlots();
});

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (cart.size === 0) {
    bookingMessage.textContent = 'Please add at least one item to your cart.';
    bookingMessage.className = 'message error';
    return;
  }

  const studentId = Number(studentIdInput.value);
  const slotId = Number(pickupSlotSelect.value);
  const bookingDate = bookingDateInput.value;

  if (!Number.isInteger(studentId) || studentId <= 0) {
    bookingMessage.textContent = 'Enter a valid student ID.';
    bookingMessage.className = 'message error';
    return;
  }

  if (!Number.isInteger(slotId) || slotId <= 0 || !bookingDate) {
    bookingMessage.textContent = 'Choose a valid date and pickup slot.';
    bookingMessage.className = 'message error';
    return;
  }

  const items = Array.from(cart, ([item_id, quantity]) => ({
    item_id,
    quantity
  }));

  submitBookingButton.disabled = true;
  submitBookingButton.textContent = 'Submitting booking...';
  bookingMessage.textContent = '';

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_id: studentId,
        slot_id: slotId,
        booking_date: bookingDate,
        items,
        payment_mode: paymentModeSelect.value
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Booking could not be created');
    }

    bookingConfirmation.replaceChildren();

    const heading = document.createElement('h3');
    heading.textContent = 'Booking confirmed';

    const bookingLine = document.createElement('p');
    bookingLine.textContent = `Booking ID: ${result.booking_id}`;

    const tokenLine = document.createElement('p');
    tokenLine.textContent = `Queue token: ${result.token_no}`;

    const note = document.createElement('p');
    note.textContent =
      'Your booking has been recorded. Check the queue status before pickup.';

    bookingConfirmation.append(heading, bookingLine, tokenLine, note);
    bookingConfirmation.hidden = false;

    cart.clear();
    renderMenu();
    renderCart();

    bookingMessage.textContent = 'Your booking was created successfully.';
    bookingMessage.className = 'message success';

    await loadPickupSlots();
  } catch (error) {
    bookingMessage.textContent = error.message;
    bookingMessage.className = 'message error';
  } finally {
    submitBookingButton.disabled = false;
    submitBookingButton.textContent = 'Confirm booking';
  }
});

loadPickupSlots();


const lookupForm = document.getElementById('lookup-form');
const lookupBookingId = document.getElementById('lookup-booking-id');
const lookupButton = document.getElementById('lookup-button');
const lookupMessage = document.getElementById('lookup-message');
const lookupResult = document.getElementById('lookup-result');

function addLookupText(parent, tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text;

  if (className) {
    element.className = className;
  }

  parent.append(element);
  return element;
}

lookupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const bookingId = Number(lookupBookingId.value);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    lookupMessage.textContent = 'Enter a valid positive booking ID.';
    lookupMessage.className = 'message error';
    return;
  }

  lookupButton.disabled = true;
  lookupButton.textContent = 'Searching...';
  lookupMessage.textContent = '';
  lookupResult.replaceChildren();
  lookupResult.hidden = true;

  try {
    const response = await fetch(
      `/api/bookings/${encodeURIComponent(bookingId)}`
    );

    const responseText = await response.text();
    let booking;

    try {
      booking = JSON.parse(responseText);
    } catch {
      throw new Error('Unexpected server response. Check the server terminal.');
    }

    if (!response.ok) {
      throw new Error(booking.error || 'Unable to find booking.');
    }

    addLookupText(lookupResult, 'h3', `Booking #${booking.booking_id}`);

    addLookupText(
      lookupResult,
      'p',
      `Booking date: ${booking.booking_date}`
    );

    addLookupText(
      lookupResult,
      'p',
      `Booking status: ${booking.booking_status}`
    );

    addLookupText(
      lookupResult,
      'p',
      `Total amount: ${formatPrice(booking.total_amount)}`
    );

    addLookupText(
      lookupResult,
      'p',
      `Queue token: ${booking.token_no ?? 'Not assigned'}`
    );

    addLookupText(
      lookupResult,
      'p',
      `Queue status: ${booking.queue_status ?? 'Not available'}`
    );

    addLookupText(
      lookupResult,
      'p',
      `Payment method: ${booking.payment_mode ?? 'Not available'}`
    );

    addLookupText(
      lookupResult,
      'p',
      `Payment status: ${booking.payment_status ?? 'Not available'}`
    );

    const itemsSection = document.createElement('div');
    itemsSection.className = 'lookup-items';

    addLookupText(itemsSection, 'h4', 'Items ordered');

    const list = document.createElement('ul');

    for (const item of booking.items || []) {
      addLookupText(
        list,
        'li',
        `${item.item_name} × ${item.quantity} — ${formatPrice(item.subtotal)}`
      );
    }

    if (!booking.items || booking.items.length === 0) {
      addLookupText(list, 'li', 'No item details available.');
    }

    itemsSection.append(list);
    lookupResult.append(itemsSection);
    lookupResult.hidden = false;
  } catch (error) {
    lookupMessage.textContent = error.message;
    lookupMessage.className = 'message error';
  } finally {
    lookupButton.disabled = false;
    lookupButton.textContent = 'Find booking';
  }
});
