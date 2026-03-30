const SUPABASE_URL = "https://ijiniarsesgpaismytow.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaW5pYXJzZXNncGFpc215dG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTU2OTUsImV4cCI6MjA5MDM3MTY5NX0.C-IC3ppIycKi0NgUGEhkhfSIaieRT85iDh-0uuwR-Ko";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const PAGE = document.body.dataset.page || "admin";
const PAGE_OWNER = PAGE === "admin" ? null : PAGE;

const ownerMeta = {
  sarah: { label: "Sarah", badgeClass: "wb-sarah", cardClass: "card-sarah", tone: "tone-sarah" },
  hossam: { label: "Hossam", badgeClass: "wb-hossam", cardClass: "card-hossam", tone: "tone-hossam" }
};

const tasks = [
  { est: 1, building: "Future - Engineering", floor: "Ground", owner: "sarah" },
  { est: 1, building: "Future - Engineering", floor: "1st floor", owner: "sarah" },
  { est: 1, building: "Future - Engineering", floor: "2nd floor", owner: "hossam" },
  { est: 1, building: "Future - Engineering", floor: "3rd floor", owner: "hossam" },
  { est: 1, building: "Future - Pharmacy", floor: "Basement", owner: "sarah" },
  { est: 1, building: "Future - Pharmacy", floor: "Ground", owner: "sarah" },
  { est: 1, building: "Future - Pharmacy", floor: "1st floor", owner: "sarah" },
  { est: 1, building: "Future - Pharmacy", floor: "2nd floor", owner: "hossam" },
  { est: 1, building: "Future - Pharmacy", floor: "3rd floor", owner: "hossam" },
  { est: 1, building: "Future - Political Science", floor: "Basement", owner: "sarah" },
  { est: 1, building: "Future - Political Science", floor: "Ground", owner: "sarah" },
  { est: 1, building: "Future - Political Science", floor: "1st floor", owner: "hossam" },
  { est: 1, building: "Future - Political Science", floor: "2nd floor", owner: "hossam" },
  { est: 1, building: "Future - Business", floor: "Basement", owner: "sarah" },
  { est: 1, building: "Future - Business", floor: "1st floor", owner: "sarah" },
  { est: 1, building: "Future - Business", floor: "2nd floor", owner: "hossam" },
  { est: 1, building: "Future - Business", floor: "3rd floor", owner: "hossam" },
  { est: 1, building: "Future - Dentistry", floor: "Ground", owner: "sarah" },
  { est: 1, building: "Future - Dentistry", floor: "1st floor", owner: "sarah" },
  { est: 1, building: "Future - Dentistry", floor: "2nd floor", owner: "hossam" },
  { est: 1, building: "Alex - Engineering B", floor: "1st floor", owner: "sarah" },
  { est: 1, building: "Alex - Engineering B", floor: "2nd floor", owner: "sarah" },
  { est: 1, building: "Alex - Engineering B", floor: "3rd floor", owner: "hossam" },
  { est: 1, building: "Alex - Engineering B", floor: "4th floor", owner: "hossam" },
  { est: 1, building: "Alex - Pharmacy", floor: "2nd floor", owner: "sarah" },
  { est: 1, building: "Alex - Pharmacy", floor: "3rd floor", owner: "sarah" },
  { est: 1, building: "Alex - Pharmacy", floor: "4th floor", owner: "hossam" },
  { est: 1, building: "Alex - Pharmacy", floor: "5th floor", owner: "hossam" },
  { est: 1, building: "Damietta - Engineering", floor: "2nd floor", owner: "sarah" },
  { est: 1, building: "Damietta - Engineering", floor: "3rd floor", owner: "hossam" },
  { est: 1, building: "Damietta - Engineering", floor: "4th floor", owner: "hossam" },
  { est: 2, building: "Alex - Pharmacy", floor: "2nd floor", owner: "sarah" },
  { est: 2, building: "Alex - Pharmacy", floor: "3rd floor", owner: "sarah" },
  { est: 2, building: "Alex - Pharmacy", floor: "4th floor", owner: "hossam" },
  { est: 2, building: "Alex - Pharmacy", floor: "5th floor", owner: "hossam" },
  { est: 2, building: "Damietta - Medicine", floor: "1st floor", owner: "hossam" },
  { est: 2, building: "Future - Political Sc", floor: "Ground", owner: "sarah" },
  { est: 2, building: "Future - Political Sc", floor: "1st floor", owner: "sarah" },
  { est: 2, building: "Future - Political Sc", floor: "2nd floor", owner: "hossam" },
  { est: 2, building: "Future - Political Sc", floor: "Basement", owner: "hossam" },
  { est: 2, building: "Future - Business", floor: "1st floor", owner: "sarah" },
  { est: 2, building: "Future - Business", floor: "2nd floor", owner: "sarah" },
  { est: 2, building: "Future - Business", floor: "3rd floor", owner: "hossam" },
  { est: 2, building: "Future - Business", floor: "Basement", owner: "hossam" }
].map((task, idx) => ({
  ...task,
  idx,
  zeroBasedId: idx,
  oneBasedId: idx + 1
}));

const EXPECTED_TASK_COUNT = tasks.length;
const stateOrder = ["todo", "wip", "done"];
const stateLabel = {
  todo: "To Do",
  wip: "In Progress",
  done: "Done"
};

const stateClass = {
  todo: "s-todo",
  wip: "s-wip",
  done: "s-done"
};

const statuses = {};
let activeStatus = null;
let idMode = null;
let warningMessage = "";

const statsEl = document.getElementById("stats");
const boardEl = document.getElementById("board");
const dotEl = document.getElementById("dot");
const syncLabelEl = document.getElementById("sync-label");
const warningEl = document.getElementById("db-warning");
const filterButtons = Array.from(document.querySelectorAll("[data-status-filter]"));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setDot(state) {
  dotEl.className = "dot " + (state === "ok" ? "green" : state === "saving" ? "orange" : "red");
  syncLabelEl.textContent =
    state === "ok" ? "Synced" :
    state === "saving" ? "Saving..." :
    "Connection issue";
}

function renderWarning() {
  if (!warningEl) {
    return;
  }

  warningEl.textContent = warningMessage;
  warningEl.classList.toggle("is-hidden", !warningMessage);
}

function setWarning(message) {
  warningMessage = message;
  renderWarning();
}

function clearWarning() {
  setWarning("");
}

function clearStatuses() {
  Object.keys(statuses).forEach((key) => {
    delete statuses[key];
  });
}

function detectIdMode(rows) {
  const ids = new Set(rows.map((row) => row.id));
  if (!ids.size) {
    return null;
  }

  const zeroBasedSignals = Number(ids.has(0)) + Number(ids.has(EXPECTED_TASK_COUNT - 1));
  const oneBasedSignals = Number(ids.has(1)) + Number(ids.has(EXPECTED_TASK_COUNT));

  if (oneBasedSignals > zeroBasedSignals) {
    return "one-based";
  }

  if (zeroBasedSignals > oneBasedSignals) {
    return "zero-based";
  }

  if (ids.has(1) && !ids.has(0)) {
    return "one-based";
  }

  if (ids.has(0) && !ids.has(1)) {
    return "zero-based";
  }

  return null;
}

function inferIdModeFromRowId(rowId) {
  if (rowId === 0 || rowId === EXPECTED_TASK_COUNT - 1) {
    idMode = "zero-based";
  } else if (rowId === 1 || rowId === EXPECTED_TASK_COUNT) {
    idMode = "one-based";
  }
}

function getCandidateDbIds(task) {
  const orderedIds = idMode === "one-based"
    ? [task.oneBasedId, task.zeroBasedId]
    : [task.zeroBasedId, task.oneBasedId];

  return Array.from(new Set(orderedIds));
}

function getScopedTasks() {
  return PAGE_OWNER ? tasks.filter((task) => task.owner === PAGE_OWNER) : tasks;
}

function getTaskState(task) {
  for (const dbId of getCandidateDbIds(task)) {
    if (statuses[dbId]) {
      return statuses[dbId];
    }
  }

  return "todo";
}

function getVisibleTasks() {
  const scopedTasks = getScopedTasks();
  return activeStatus
    ? scopedTasks.filter((task) => getTaskState(task) === activeStatus)
    : scopedTasks;
}

function renderStats() {
  const scopedTasks = getScopedTasks();
  const totals = { todo: 0, wip: 0, done: 0 };

  scopedTasks.forEach((task) => {
    totals[getTaskState(task)] += 1;
  });

  const cards = PAGE_OWNER
    ? [
        { value: scopedTasks.length, label: `${ownerMeta[PAGE_OWNER].label} Tasks`, tone: ownerMeta[PAGE_OWNER].tone },
        { value: totals.todo, label: "To Do", tone: "tone-todo" },
        { value: totals.wip, label: "In Progress", tone: "tone-wip" },
        { value: totals.done, label: "Done", tone: "tone-done" }
      ]
    : [
        { value: tasks.filter((task) => task.owner === "sarah").length, label: "Sarah Tasks", tone: "tone-sarah" },
        { value: tasks.filter((task) => task.owner === "hossam").length, label: "Hossam Tasks", tone: "tone-hossam" },
        { value: totals.todo, label: "To Do", tone: "tone-todo" },
        { value: totals.wip, label: "In Progress", tone: "tone-wip" },
        { value: totals.done, label: "Done", tone: "tone-done" }
      ];

  statsEl.innerHTML = cards.map((card) => `
    <div class="stat-card ${card.tone}">
      <strong>${card.value}</strong>
      <span>${escapeHtml(card.label)}</span>
    </div>
  `).join("");
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", activeStatus === button.dataset.statusFilter);
  });
}

function toggleStatusFilter(status) {
  activeStatus = activeStatus === status ? null : status;
  render();
}

function buildGroups(tasksToRender) {
  const groups = new Map();

  tasksToRender.forEach((task) => {
    const key = `${task.est}|||${task.building}|||${task.owner}`;
    if (!groups.has(key)) {
      groups.set(key, {
        est: task.est,
        building: task.building,
        owner: task.owner,
        items: []
      });
    }

    groups.get(key).items.push(task);
  });

  return Array.from(groups.values());
}

function renderBoard() {
  const grouped = buildGroups(getVisibleTasks());
  const byEst = { 1: [], 2: [] };

  grouped.forEach((group) => {
    byEst[group.est].push(group);
  });

  let html = "";

  [1, 2].forEach((est) => {
    if (!byEst[est].length) {
      return;
    }

    html += `<section class="est-section"><div class="est-label">EST ${est}</div><div class="grid">`;

    byEst[est].forEach((group) => {
      const owner = ownerMeta[group.owner];

      html += `<article class="card ${owner.cardClass}">`;
      html += `<div class="est-tag">EST ${est} · Writing</div>`;
      html += `<div class="card-head"><h2 class="bname">${escapeHtml(group.building)}</h2><span class="who-badge ${owner.badgeClass}">${owner.label}</span></div>`;

      group.items.forEach((task) => {
        const state = getTaskState(task);
        html += `
          <div class="task-row">
            <div class="floor-name">${escapeHtml(task.floor)}</div>
            <span class="arrow">to xlsx</span>
            <button type="button" class="status-btn ${stateClass[state]}" onclick="cycleStatus(${task.idx})">${stateLabel[state]}</button>
          </div>
        `;
      });

      html += `</article>`;
    });

    html += `</div></section>`;
  });

  if (!html) {
    html = `<div class="empty-state">No tasks match the current filter.</div>`;
  }

  boardEl.innerHTML = html;
}

function render() {
  renderWarning();
  renderStats();
  updateFilterButtons();
  renderBoard();
}

function getSetupGuidance() {
  return "Supabase returned 0 visible rows for task_statuses. This usually means the table is empty for the anon role, or RLS blocks select. Run supabase_setup.sql once in the Supabase SQL Editor.";
}

async function loadStatuses() {
  setDot("saving");
  clearStatuses();

  const { data, error } = await sb.from("task_statuses").select("id,status").order("id");

  if (error) {
    setWarning(`Could not load task statuses from Supabase: ${error.message}`);
    setDot("red");
    render();
    return;
  }

  const rows = Array.isArray(data) ? data : [];
  idMode = detectIdMode(rows);

  rows.forEach((row) => {
    statuses[row.id] = row.status;
  });

  if (!rows.length) {
    setWarning(getSetupGuidance());
  } else if (rows.length < EXPECTED_TASK_COUNT) {
    setWarning(`Loaded ${rows.length} visible rows for ${EXPECTED_TASK_COUNT} tasks. Seed the missing rows in Supabase and confirm anon select/update policies exist.`);
  } else {
    clearWarning();
  }

  setDot("ok");
  render();
}

async function persistStatus(task, nextState) {
  let lastError = null;

  for (const dbId of getCandidateDbIds(task)) {
    const { data, error } = await sb
      .from("task_statuses")
      .update({ status: nextState })
      .eq("id", dbId)
      .select("id,status");

    if (error) {
      lastError = error;
      continue;
    }

    if (Array.isArray(data) && data.length > 0) {
      inferIdModeFromRowId(data[0].id);
      statuses[data[0].id] = data[0].status;
      return { ok: true, dbId: data[0].id };
    }
  }

  return { ok: false, error: lastError };
}

async function cycleStatus(taskIdx) {
  const task = tasks[taskIdx];
  if (!task) {
    return;
  }

  const current = getTaskState(task);
  const next = stateOrder[(stateOrder.indexOf(current) + 1) % stateOrder.length];
  const candidateIds = getCandidateDbIds(task);
  const optimisticId = candidateIds[0];
  const previousStates = Object.fromEntries(candidateIds.map((dbId) => [dbId, statuses[dbId]]));

  statuses[optimisticId] = next;
  render();
  setDot("saving");

  const result = await persistStatus(task, next);

  if (result.ok) {
    candidateIds.forEach((dbId) => {
      if (dbId !== result.dbId) {
        delete statuses[dbId];
      }
    });
    statuses[result.dbId] = next;
    setDot("ok");
    render();
    return;
  }

  candidateIds.forEach((dbId) => {
    if (previousStates[dbId] === undefined) {
      delete statuses[dbId];
    } else {
      statuses[dbId] = previousStates[dbId];
    }
  });

  setWarning(`Save failed for "${task.building} / ${task.floor}". No visible database row accepted the update. Check task_statuses rows, row IDs, and anon RLS policies for select/update.`);
  setDot("red");
  render();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toggleStatusFilter(button.dataset.statusFilter);
  });
});

sb.channel("task_statuses")
  .on("postgres_changes", { event: "UPDATE", schema: "public", table: "task_statuses" }, (payload) => {
    inferIdModeFromRowId(payload.new.id);
    statuses[payload.new.id] = payload.new.status;
    render();
  })
  .subscribe();

window.cycleStatus = cycleStatus;

render();
loadStatuses();
