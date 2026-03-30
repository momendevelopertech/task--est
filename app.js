const SUPABASE_URL = "https://ijiniarsesgpaismytow.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaW5pYXJzZXNncGFpc215dG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTU2OTUsImV4cCI6MjA5MDM3MTY5NX0.C-IC3ppIycKi0NgUGEhkhfSIaieRT85iDh-0uuwR-Ko";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const PAGE = document.body.dataset.page || "admin";
const PAGE_OWNER = PAGE === "admin" ? null : PAGE;

const ownerMeta = {
  sarah: { label: "Sarah", badgeClass: "wb-sarah", cardClass: "card-sarah", tone: "tone-sarah" },
  hossam: { label: "Hossam", badgeClass: "wb-hossam", cardClass: "card-hossam", tone: "tone-hossam" }
};

const taskDefinitions = [
  ["1__future-engineering__ground__sarah", 1, "Future - Engineering", "Ground", "sarah"],
  ["1__future-engineering__1st-floor__sarah", 1, "Future - Engineering", "1st floor", "sarah"],
  ["1__future-engineering__2nd-floor__hossam", 1, "Future - Engineering", "2nd floor", "hossam"],
  ["1__future-engineering__3rd-floor__hossam", 1, "Future - Engineering", "3rd floor", "hossam"],
  ["1__future-pharmacy__basement__sarah", 1, "Future - Pharmacy", "Basement", "sarah"],
  ["1__future-pharmacy__ground__sarah", 1, "Future - Pharmacy", "Ground", "sarah"],
  ["1__future-pharmacy__1st-floor__sarah", 1, "Future - Pharmacy", "1st floor", "sarah"],
  ["1__future-pharmacy__2nd-floor__hossam", 1, "Future - Pharmacy", "2nd floor", "hossam"],
  ["1__future-pharmacy__3rd-floor__hossam", 1, "Future - Pharmacy", "3rd floor", "hossam"],
  ["1__future-political-science__basement__sarah", 1, "Future - Political Science", "Basement", "sarah"],
  ["1__future-political-science__ground__sarah", 1, "Future - Political Science", "Ground", "sarah"],
  ["1__future-political-science__1st-floor__hossam", 1, "Future - Political Science", "1st floor", "hossam"],
  ["1__future-political-science__2nd-floor__hossam", 1, "Future - Political Science", "2nd floor", "hossam"],
  ["1__future-business__basement__sarah", 1, "Future - Business", "Basement", "sarah"],
  ["1__future-business__1st-floor__sarah", 1, "Future - Business", "1st floor", "sarah"],
  ["1__future-business__2nd-floor__hossam", 1, "Future - Business", "2nd floor", "hossam"],
  ["1__future-business__3rd-floor__hossam", 1, "Future - Business", "3rd floor", "hossam"],
  ["1__future-dentistry__ground__sarah", 1, "Future - Dentistry", "Ground", "sarah"],
  ["1__future-dentistry__1st-floor__sarah", 1, "Future - Dentistry", "1st floor", "sarah"],
  ["1__future-dentistry__2nd-floor__hossam", 1, "Future - Dentistry", "2nd floor", "hossam"],
  ["1__alex-engineering-b__1st-floor__sarah", 1, "Alex - Engineering B", "1st floor", "sarah"],
  ["1__alex-engineering-b__2nd-floor__sarah", 1, "Alex - Engineering B", "2nd floor", "sarah"],
  ["1__alex-engineering-b__3rd-floor__hossam", 1, "Alex - Engineering B", "3rd floor", "hossam"],
  ["1__alex-engineering-b__4th-floor__hossam", 1, "Alex - Engineering B", "4th floor", "hossam"],
  ["1__alex-pharmacy__2nd-floor__sarah", 1, "Alex - Pharmacy", "2nd floor", "sarah"],
  ["1__alex-pharmacy__3rd-floor__sarah", 1, "Alex - Pharmacy", "3rd floor", "sarah"],
  ["1__alex-pharmacy__4th-floor__hossam", 1, "Alex - Pharmacy", "4th floor", "hossam"],
  ["1__alex-pharmacy__5th-floor__hossam", 1, "Alex - Pharmacy", "5th floor", "hossam"],
  ["1__damietta-engineering__2nd-floor__sarah", 1, "Damietta - Engineering", "2nd floor", "sarah"],
  ["1__damietta-engineering__3rd-floor__hossam", 1, "Damietta - Engineering", "3rd floor", "hossam"],
  ["1__damietta-engineering__4th-floor__hossam", 1, "Damietta - Engineering", "4th floor", "hossam"],
  ["2__alex-pharmacy__2nd-floor__sarah", 2, "Alex - Pharmacy", "2nd floor", "sarah"],
  ["2__alex-pharmacy__3rd-floor__sarah", 2, "Alex - Pharmacy", "3rd floor", "sarah"],
  ["2__alex-pharmacy__4th-floor__hossam", 2, "Alex - Pharmacy", "4th floor", "hossam"],
  ["2__alex-pharmacy__5th-floor__hossam", 2, "Alex - Pharmacy", "5th floor", "hossam"],
  ["2__damietta-medicine__1st-floor__hossam", 2, "Damietta - Medicine", "1st floor", "hossam"],
  ["2__future-political-sc__ground__sarah", 2, "Future - Political Sc", "Ground", "sarah"],
  ["2__future-political-sc__1st-floor__sarah", 2, "Future - Political Sc", "1st floor", "sarah"],
  ["2__future-political-sc__2nd-floor__hossam", 2, "Future - Political Sc", "2nd floor", "hossam"],
  ["2__future-political-sc__basement__hossam", 2, "Future - Political Sc", "Basement", "hossam"],
  ["2__future-business__1st-floor__sarah", 2, "Future - Business", "1st floor", "sarah"],
  ["2__future-business__2nd-floor__sarah", 2, "Future - Business", "2nd floor", "sarah"],
  ["2__future-business__3rd-floor__hossam", 2, "Future - Business", "3rd floor", "hossam"],
  ["2__future-business__basement__hossam", 2, "Future - Business", "Basement", "hossam"]
];

const tasks = taskDefinitions.map(([taskKey, est, building, floor, owner], idx) => ({
  taskKey,
  est,
  building,
  floor,
  owner,
  idx,
  zeroBasedId: idx,
  oneBasedId: idx + 1
}));

const EXPECTED_TASK_COUNT = tasks.length;
const knownTaskKeys = new Set(tasks.map((task) => task.taskKey));
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

const statusesByKey = {};
const statusesById = {};
const availableTaskKeys = new Set();
let activeStatus = null;
let idMode = null;
let warningMessage = "";
let taskKeyColumnAvailable = false;
let hasLoadedStatuses = false;

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

function hasOwn(map, key) {
  return Object.prototype.hasOwnProperty.call(map, key);
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
  availableTaskKeys.clear();

  Object.keys(statusesByKey).forEach((key) => {
    delete statusesByKey[key];
  });

  Object.keys(statusesById).forEach((key) => {
    delete statusesById[key];
  });
}

function detectIdMode(rows) {
  const ids = new Set(
    rows
      .map((row) => row.id)
      .filter((value) => Number.isInteger(value))
  );

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

  if (ids.has(0)) {
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

function getLegacyDisplayId(task) {
  return idMode === "one-based" ? task.oneBasedId : task.zeroBasedId;
}

function getLegacyWriteIds(task) {
  if (idMode === "one-based") {
    return [task.oneBasedId];
  }

  if (idMode === "zero-based") {
    return [task.zeroBasedId];
  }

  return [task.zeroBasedId, task.oneBasedId];
}

function getScopedTasks() {
  return PAGE_OWNER ? tasks.filter((task) => task.owner === PAGE_OWNER) : tasks;
}

function getTaskState(task) {
  if (availableTaskKeys.has(task.taskKey) && hasOwn(statusesByKey, task.taskKey)) {
    return statusesByKey[task.taskKey];
  }

  const legacyId = getLegacyDisplayId(task);
  if (hasOwn(statusesById, legacyId)) {
    return statusesById[legacyId];
  }

  return "todo";
}

function applyRowStatus(row) {
  if (!row || typeof row.status !== "string") {
    return;
  }

  if (typeof row.task_key === "string" && knownTaskKeys.has(row.task_key)) {
    availableTaskKeys.add(row.task_key);
    statusesByKey[row.task_key] = row.status;
  }

  if (Number.isInteger(row.id)) {
    statusesById[row.id] = row.status;
  }
}

function captureTaskSnapshot(task) {
  const legacyId = getLegacyDisplayId(task);

  return {
    taskKey: task.taskKey,
    hasConfirmedTaskKey: availableTaskKeys.has(task.taskKey),
    hasKeyStatus: hasOwn(statusesByKey, task.taskKey),
    keyStatus: statusesByKey[task.taskKey],
    legacyId,
    hasLegacyStatus: hasOwn(statusesById, legacyId),
    legacyStatus: statusesById[legacyId]
  };
}

function restoreTaskSnapshot(snapshot) {
  if (snapshot.hasConfirmedTaskKey && snapshot.hasKeyStatus) {
    availableTaskKeys.add(snapshot.taskKey);
    statusesByKey[snapshot.taskKey] = snapshot.keyStatus;
  } else {
    if (!snapshot.hasConfirmedTaskKey) {
      availableTaskKeys.delete(snapshot.taskKey);
    }
    delete statusesByKey[snapshot.taskKey];
  }

  if (snapshot.hasLegacyStatus) {
    statusesById[snapshot.legacyId] = snapshot.legacyStatus;
  } else {
    delete statusesById[snapshot.legacyId];
  }
}

function setOptimisticTaskState(task, nextState) {
  if (availableTaskKeys.has(task.taskKey)) {
    statusesByKey[task.taskKey] = nextState;
  }
  statusesById[getLegacyDisplayId(task)] = nextState;
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

function renderBoard() {
  const visibleTasks = getVisibleTasks();
  const byEst = { 1: [], 2: [] };

  visibleTasks.forEach((task) => {
    byEst[task.est].push(task);
  });

  let html = "";

  [1, 2].forEach((est) => {
    if (!byEst[est].length) {
      return;
    }

    html += `<section class="est-section"><div class="est-label">EST ${est}</div><div class="grid">`;

    byEst[est].forEach((task) => {
      const owner = ownerMeta[task.owner];
      const state = getTaskState(task);

      html += `
        <article class="card task-card ${owner.cardClass}" data-task-key="${escapeHtml(task.taskKey)}">
          <div class="task-card-top">
            <span class="est-tag">EST ${task.est} / Writing</span>
            <span class="who-badge ${owner.badgeClass}">${owner.label}</span>
          </div>

          <div class="task-card-body">
            <h2 class="bname">${escapeHtml(task.building)}</h2>
            <div class="task-floor-row">
              <span class="task-floor">${escapeHtml(task.floor)}</span>
              <span class="task-flow">to xlsx</span>
            </div>
          </div>

          <button
            type="button"
            class="status-btn task-status-btn ${stateClass[state]}"
            onclick="cycleStatus(${task.idx})"
            ${hasLoadedStatuses ? "" : "disabled"}
            aria-label="Change status for ${escapeHtml(task.building)} ${escapeHtml(task.floor)}"
          >${stateLabel[state]}</button>
        </article>
      `;
    });

    html += "</div></section>";
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
  return "Supabase returned 0 visible rows for task_statuses. Run supabase_setup.sql once in the Supabase SQL Editor.";
}

function getTaskKeyGuidance() {
  return "Run the latest supabase_setup.sql so every task gets a stable task_key. That prevents one floor from inheriting another floor's status if task order ever changes.";
}

function isMissingTaskKeyError(error) {
  const message = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  return message.includes("task_key");
}

async function selectStatusRows() {
  let response = await sb.from("task_statuses").select("id,status,task_key").order("id");

  if (!response.error) {
    return { ...response, hasTaskKeyColumn: true };
  }

  if (!isMissingTaskKeyError(response.error)) {
    return { ...response, hasTaskKeyColumn: false };
  }

  response = await sb.from("task_statuses").select("id,status").order("id");
  return { ...response, hasTaskKeyColumn: false };
}

async function loadStatuses() {
  setDot("saving");
  clearStatuses();
  hasLoadedStatuses = false;

  const { data, error, hasTaskKeyColumn } = await selectStatusRows();

  taskKeyColumnAvailable = hasTaskKeyColumn;

  if (error) {
    setWarning(`Could not load task statuses from Supabase: ${error.message}`);
    setDot("red");
    render();
    return;
  }

  const rows = Array.isArray(data) ? data : [];
  idMode = detectIdMode(rows);

  rows.forEach((row) => {
    applyRowStatus(row);
  });

  const matchedTaskKeys = rows.filter((row) => typeof row.task_key === "string" && knownTaskKeys.has(row.task_key)).length;

  if (!rows.length) {
    setWarning(getSetupGuidance());
  } else if (rows.length < EXPECTED_TASK_COUNT) {
    setWarning(`Loaded ${rows.length} visible rows for ${EXPECTED_TASK_COUNT} tasks. Seed the missing rows in Supabase and confirm anon select/update policies exist.`);
  } else if (!taskKeyColumnAvailable) {
    setWarning(`${getTaskKeyGuidance()} The dashboard is still running on legacy numeric IDs.`);
  } else if (matchedTaskKeys < EXPECTED_TASK_COUNT) {
    setWarning(`Loaded ${matchedTaskKeys} stable task keys for ${EXPECTED_TASK_COUNT} tasks. ${getTaskKeyGuidance()}`);
  } else {
    clearWarning();
  }

  hasLoadedStatuses = true;
  setDot("ok");
  render();
}

async function persistStatusByTaskKey(task, nextState) {
  const { data, error } = await sb
    .from("task_statuses")
    .update({ status: nextState })
    .eq("task_key", task.taskKey)
    .select("id,status,task_key");

  if (error) {
    if (isMissingTaskKeyError(error)) {
      return { ok: false, needsLegacyFallback: true };
    }

    return { ok: false, error };
  }

  if (Array.isArray(data) && data.length > 0) {
    inferIdModeFromRowId(data[0].id);
    applyRowStatus(data[0]);
    return { ok: true, row: data[0] };
  }

  return { ok: false, needsLegacyFallback: true };
}

async function persistStatusByLegacyId(task, nextState) {
  let lastError = null;
  const selectColumns = taskKeyColumnAvailable ? "id,status,task_key" : "id,status";

  for (const dbId of getLegacyWriteIds(task)) {
    const { data, error } = await sb
      .from("task_statuses")
      .update({ status: nextState })
      .eq("id", dbId)
      .select(selectColumns);

    if (error) {
      lastError = error;
      continue;
    }

    if (Array.isArray(data) && data.length > 0) {
      inferIdModeFromRowId(data[0].id);
      applyRowStatus(data[0]);
      return { ok: true, row: data[0] };
    }
  }

  return { ok: false, error: lastError };
}

async function persistStatus(task, nextState) {
  if (taskKeyColumnAvailable) {
    const keyResult = await persistStatusByTaskKey(task, nextState);
    if (keyResult.ok || !keyResult.needsLegacyFallback) {
      return keyResult;
    }
  }

  return persistStatusByLegacyId(task, nextState);
}

async function cycleStatus(taskIdx) {
  if (!hasLoadedStatuses) {
    setWarning("Please wait for the dashboard to finish syncing before changing a status.");
    render();
    return;
  }

  const task = tasks[taskIdx];
  if (!task) {
    return;
  }

  const current = getTaskState(task);
  const next = stateOrder[(stateOrder.indexOf(current) + 1) % stateOrder.length];
  const snapshot = captureTaskSnapshot(task);

  setOptimisticTaskState(task, next);
  render();
  setDot("saving");

  const result = await persistStatus(task, next);

  if (result.ok) {
    setDot("ok");
    render();
    return;
  }

  restoreTaskSnapshot(snapshot);
  setWarning(`Save failed for "${task.building} / ${task.floor}". Check the row visibility, RLS policies, and run the updated supabase_setup.sql so task_key values stay aligned with each floor.`);
  setDot("red");
  render();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toggleStatusFilter(button.dataset.statusFilter);
  });
});

sb.channel("task_statuses_live")
  .on("postgres_changes", { event: "*", schema: "public", table: "task_statuses" }, (payload) => {
    if (payload?.new?.task_key && knownTaskKeys.has(payload.new.task_key)) {
      applyRowStatus(payload.new);
      render();
      return;
    }

    if (Number.isInteger(payload?.new?.id)) {
      inferIdModeFromRowId(payload.new.id);
      applyRowStatus(payload.new);
      render();
    }
  })
  .subscribe();

window.cycleStatus = cycleStatus;

render();
loadStatuses();
