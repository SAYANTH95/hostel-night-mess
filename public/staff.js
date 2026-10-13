
const queueTableBody = document.getElementById('queue-table-body');
const queueMessage = document.getElementById('queue-message');
const refreshQueueButton = document.getElementById('refresh-queue');

const waitingCount = document.getElementById('waiting-count');
const preparingCount = document.getElementById('preparing-count');
const readyCount = document.getElementById('ready-count');

const completedTableBody = document.getElementById('completed-table-body');
const completedMessage = document.getElementById('completed-message');

const refreshCompletedButton = document.getElementById('refresh-completed');

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function addCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = String(value);
  row.append(cell);
  return cell;
}


async function updateQueueStatus(order, nextStatus, button) {
  button.disabled = true;
  button.textContent = 'Updating...';
  queueMessage.className = '';
  queueMessage.textContent = `Updating token #${order.token_no}...`;

  try {
    const response = await fetch(
      `/api/queue/${order.token_id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Unable to update queue status.');
    }

    queueMessage.className = 'success';
    queueMessage.textContent =
      `Token #${order.token_no} is now ${result.queue_status}.`;

    await loadQueue();
  } catch (error) {
    queueMessage.className = 'error';
    queueMessage.textContent = error.message;
    button.disabled = false;
    button.textContent = `Mark ${nextStatus.toLowerCase()}`;
  }
}


function renderQueue(queue) {
  queueTableBody.replaceChildren();

  waitingCount.textContent = queue.filter(
    order => order.queue_status === 'WAITING'
  ).length;

  preparingCount.textContent = queue.filter(
    order => order.queue_status === 'PREPARING'
  ).length;

  readyCount.textContent = queue.filter(
    order => order.queue_status === 'READY'
  ).length;

  if (queue.length === 0) {
    const row = document.createElement('tr');
    const cell = addCell(row, 'No active orders in the queue.');
    cell.colSpan = 7;
    cell.className = 'empty-row';
    queueTableBody.append(row);
    return;
  }

  for (const order of queue) {
    const row = document.createElement('tr');

    addCell(row, `#${order.token_no}`);
    addCell(row, order.booking_id);
    addCell(row, order.student_id);
    addCell(row, order.slot_id);
    addCell(row, formatPrice(order.total_amount));

    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');

    statusBadge.className =
      `status status-${String(order.queue_status).toLowerCase()}`;
    statusBadge.textContent = order.queue_status;

    statusCell.append(statusBadge);
    row.append(statusCell);

    const actionCell = document.createElement('td');

    const nextStatus = {
        WAITING: 'PREPARING',
        PREPARING: 'READY',
        READY: 'COLLECTED'
    }[order.queue_status];

    if (nextStatus) {
        const actionButton = document.createElement('button');
        actionButton.type = 'button';
        actionButton.textContent = `Mark ${nextStatus.toLowerCase()}`;

    actionButton.addEventListener('click', () => {
    updateQueueStatus(order, nextStatus, actionButton);
    });

    actionCell.append(actionButton);
    } else {
        actionCell.textContent = 'Completed';
    }

    row.append(actionCell);

    queueTableBody.append(row);
  }
}

async function loadQueue() {
  refreshQueueButton.disabled = true;
  queueMessage.className = '';
  queueMessage.textContent = 'Loading queue...';

  try {
    const response = await fetch('/api/queue');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Unable to load queue.');
    }

    if (!Array.isArray(result.queue)) {
      throw new Error('Unexpected queue response.');
    }

    renderQueue(result.queue);

    queueMessage.textContent =
      `Showing ${result.count} active orders for ${result.date}.`;
    queueMessage.className = 'success';
  } catch (error) {
    console.error('Queue loading failed:', error);
    queueMessage.textContent = error.message;
    queueMessage.className = 'error';

    queueTableBody.replaceChildren();
    const row = document.createElement('tr');
    const cell = addCell(row, 'Could not load queue data.');
    cell.colSpan = 7;
    cell.className = 'empty-row';
    queueTableBody.append(row);
  } finally {
    refreshQueueButton.disabled = false;
  }
}

refreshQueueButton.addEventListener('click', loadQueue);
refreshCompletedButton.addEventListener('click', loadCompletedOrders);

async function loadCompletedOrders() {
  completedMessage.className = '';
  completedMessage.textContent = 'Loading completed orders...';

  try {
    const response = await fetch('/api/queue/completed');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Unable to load completed orders.');
    }

    completedTableBody.replaceChildren();

    if (result.queue.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');

      cell.colSpan = 6;
      cell.textContent = 'No completed orders for today.';
      row.appendChild(cell);
      completedTableBody.appendChild(row);
    } else {
      for (const order of result.queue) {
        const row = document.createElement('tr');

        addCell(row, `#${order.token_no}`);
        addCell(row, order.booking_id);
        addCell(row, order.student_id);
        addCell(row, order.slot_id);
        addCell(row, formatPrice(order.total_amount));

        const statusCell = document.createElement('td');
        const badge = document.createElement('span');

        badge.className = 'status-badge status-collected';
        badge.textContent = order.queue_status;

        statusCell.appendChild(badge);
        row.appendChild(statusCell);
        completedTableBody.appendChild(row);
      }
    }

    completedMessage.className = 'success';
    completedMessage.textContent =
      `Showing ${result.count} completed orders for ${result.date}.`;
  } catch (error) {
    completedMessage.className = 'error';
    completedMessage.textContent = error.message;
  }
}


loadQueue();
loadCompletedOrders();
