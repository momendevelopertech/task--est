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

const taskRecordsByKey = {};
const taskRecordsById = {};
const noteDraftsByKey = {};
const noteUiStateByKey = {};
const availableTaskKeys = new Set();
const dirtyNoteKeys = new Set();
const noteEditorOpenKeys = new Set();

let activeStatus = null;
let idMode = null;
let warningMessage = "";
let taskKeyColumnAvailable = false;
let noteColumnAvailable = false;
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

function normalizeNoteValue(value) {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n") : "";
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

function clearTransientWarning() {
  if (
    warningMessage.startsWith("Save failed for") ||
    warningMessage.startsWith("Note save failed for") ||
    warningMessage.startsWith("Please wait")
  ) {
    clearWarning();
  }
}

function clearTaskData() {
  availableTaskKeys.clear();
  dirtyNoteKeys.clear();

  [
    taskRecordsByKey,
    taskRecordsById,
    noteDraftsByKey,
    noteUiStateByKey
  ].forEach((map) => {
    Object.keys(map).forEach((key) => {
      delete map[key];
    });
  });
}

function setMapField(map, key, field, value) {
  const existing = map[key];

  if (value === undefined) {
    if (!existing) {
      return;
    }

    const next = { ...existing };
    delete next[field];

    if (Object.keys(next).length) {
      map[key] = next;
    } else {
      delete map[key];
    }

    return;
  }

  map[key] = { ...(existing || {}), [field]: value };
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

function getStoredTaskRecord(task) {
  if (availableTaskKeys.has(task.taskKey) && hasOwn(taskRecordsByKey, task.taskKey)) {
    return taskRecordsByKey[task.taskKey];
  }

  const legacyId = getLegacyDisplayId(task);
  if (hasOwn(taskRecordsById, legacyId)) {
    return taskRecordsById[legacyId];
  }

  return null;
}

function getTaskState(task) {
  const record = getStoredTaskRecord(task);
  return typeof record?.status === "string" ? record.status : "todo";
}

function getPersistedTaskNote(task) {
  const record = getStoredTaskRecord(task);
  return normalizeNoteValue(record?.note);
}

function getDisplayedTaskNote(task) {
  if (hasOwn(noteDraftsByKey, task.taskKey)) {
    return noteDraftsByKey[task.taskKey];
  }

  return getPersistedTaskNote(task);
}

function getTaskNoteUiState(task) {
  return noteUiStateByKey[task.taskKey] || "idle";
}

function isTaskNoteDirty(task) {
  return dirtyNoteKeys.has(task.taskKey);
}

function taskHasNote(task) {
  return Boolean(getDisplayedTaskNote(task).trim() || getPersistedTaskNote(task).trim());
}

function getTaskNotePreview(task) {
  return (getDisplayedTaskNote(task).trim() || getPersistedTaskNote(task).trim()).replace(/\s+/g, " ");
}

function isTaskNoteEditorOpen(task) {
  const uiState = getTaskNoteUiState(task);
  return noteEditorOpenKeys.has(task.taskKey) || dirtyNoteKeys.has(task.taskKey) || uiState === "saving" || uiState === "error";
}

function canToggleTaskNote(task) {
  if (!hasLoadedStatuses || !noteColumnAvailable) {
    return false;
  }

  return getTaskNoteUiState(task) !== "saving" && !isTaskNoteDirty(task);
}

function getTaskNoteToggleLabel(task) {
  if (!hasLoadedStatuses) {
    return "Syncing notes";
  }

  if (!noteColumnAvailable) {
    return "Notes unavailable";
  }

  if (getTaskNoteUiState(task) === "saving") {
    return "Saving...";
  }

  if (isTaskNoteDirty(task)) {
    return "Editing note";
  }

  if (isTaskNoteEditorOpen(task)) {
    return "Hide note";
  }

  return taskHasNote(task) ? "Edit note" : "Add note";
}

function applyRowData(row) {
  if (!row) {
    return;
  }

  if (typeof row.task_key === "string" && knownTaskKeys.has(row.task_key)) {
    availableTaskKeys.add(row.task_key);

    if (typeof row.status === "string") {
      setMapField(taskRecordsByKey, row.task_key, "status", row.status);
    }

    if (typeof row.note === "string") {
      const normalizedNote = normalizeNoteValue(row.note);
      setMapField(taskRecordsByKey, row.task_key, "note", normalizedNote);

      if (!dirtyNoteKeys.has(row.task_key)) {
        noteDraftsByKey[row.task_key] = normalizedNote;
        if (noteUiStateByKey[row.task_key] !== "saved") {
          noteUiStateByKey[row.task_key] = "idle";
        }
      }
    }
  }

  if (Number.isInteger(row.id)) {
    if (typeof row.status === "string") {
      setMapField(taskRecordsById, row.id, "status", row.status);
    }

    if (typeof row.note === "string") {
      setMapField(taskRecordsById, row.id, "note", normalizeNoteValue(row.note));
    }
  }
}

function captureTaskStatusSnapshot(task) {
  const legacyId = getLegacyDisplayId(task);

  return {
    taskKey: task.taskKey,
    hasConfirmedTaskKey: availableTaskKeys.has(task.taskKey),
    keyStatus: taskRecordsByKey[task.taskKey]?.status,
    legacyId,
    legacyStatus: taskRecordsById[legacyId]?.status
  };
}

function restoreTaskStatusSnapshot(snapshot) {
  if (snapshot.hasConfirmedTaskKey) {
    availableTaskKeys.add(snapshot.taskKey);
    setMapField(taskRecordsByKey, snapshot.taskKey, "status", snapshot.keyStatus);
  } else {
    availableTaskKeys.delete(snapshot.taskKey);
    setMapField(taskRecordsByKey, snapshot.taskKey, "status", undefined);
  }

  setMapField(taskRecordsById, snapshot.legacyId, "status", snapshot.legacyStatus);
}

function setOptimisticTaskStatus(task, nextState) {
  if (availableTaskKeys.has(task.taskKey)) {
    setMapField(taskRecordsByKey, task.taskKey, "status", nextState);
  }

  setMapField(taskRecordsById, getLegacyDisplayId(task), "status", nextState);
}

function getVisibleTasks() {
  const scopedTasks = getScopedTasks();
  return activeStatus
    ? scopedTasks.filter((task) => getTaskState(task) === activeStatus)
    : scopedTasks;
}

function buildTaskGroups(tasksToRender) {
  const groups = new Map();

  tasksToRender.forEach((task) => {
    const key = `${task.est}|||${task.building}`;
    if (!groups.has(key)) {
      groups.set(key, {
        est: task.est,
        building: task.building,
        owners: new Set(),
        items: [],
        totals: { todo: 0, wip: 0, done: 0 },
        noteCount: 0
      });
    }

    const group = groups.get(key);
    group.owners.add(task.owner);
    group.items.push(task);
    group.totals[getTaskState(task)] += 1;
    if (taskHasNote(task)) {
      group.noteCount += 1;
    }
  });

  return Array.from(groups.values());
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

function getGroupCardClass(group) {
  const owners = Array.from(group.owners);
  if (owners.length === 1) {
    return ownerMeta[owners[0]].cardClass;
  }

  return "card-shared";
}

function getGroupStateChipsHtml(group) {
  return stateOrder
    .filter((state) => group.totals[state] > 0)
    .map((state) => `
      <span class="summary-chip is-${state}">${group.totals[state]} ${escapeHtml(stateLabel[state])}</span>
    `)
    .join("");
}

function getGroupHighlightsHtml(group) {
  const floorLabel = `${group.items.length} ${group.items.length === 1 ? "Floor" : "Floors"}`;
  const noteLabel = group.noteCount === 1 ? "1 Note" : `${group.noteCount} Notes`;

  return `
    <div class="building-highlights">
      <span class="summary-chip">${floorLabel}</span>
      ${group.noteCount ? `<span class="summary-chip">${noteLabel}</span>` : ""}
      ${getGroupStateChipsHtml(group)}
    </div>
  `;
}

function getGroupMetaHtml(group) {
  const orderedOwners = ["sarah", "hossam"].filter((ownerKey) => group.owners.has(ownerKey));

  if (PAGE_OWNER) {
    const owner = ownerMeta[PAGE_OWNER];
    return `
      <div class="building-meta">
        <span class="who-badge ${owner.badgeClass}">${owner.label}</span>
      </div>
    `;
  }

  return `
    <div class="building-meta">
      <div class="owner-stack">
        ${orderedOwners.map((ownerKey) => `
          <span class="who-badge ${ownerMeta[ownerKey].badgeClass}">${ownerMeta[ownerKey].label}</span>
        `).join("")}
      </div>
    </div>
  `;
}

function getTaskNoteStatusInfo(task) {
  if (!hasLoadedStatuses) {
    return { label: "Waiting for sync...", className: "note-status is-muted" };
  }

  if (!noteColumnAvailable) {
    return { label: "Run SQL migration to enable notes", className: "note-status is-muted" };
  }

  const uiState = getTaskNoteUiState(task);

  if (uiState === "saving") {
    return { label: "Saving...", className: "note-status is-saving" };
  }

  if (uiState === "error") {
    return { label: "Save failed", className: "note-status is-error" };
  }

  if (uiState === "dirty") {
    return { label: "Unsaved changes", className: "note-status is-dirty" };
  }

  if (uiState === "saved") {
    return { label: "Saved", className: "note-status is-saved" };
  }

  return getPersistedTaskNote(task)
    ? { label: "Saved on board", className: "note-status is-idle" }
    : { label: "Optional", className: "note-status is-idle" };
}

function canSaveTaskNote(task) {
  if (!hasLoadedStatuses || !noteColumnAvailable) {
    return false;
  }

  return isTaskNoteDirty(task) || getTaskNoteUiState(task) === "error";
}

function getTaskNoteButtonLabel(task) {
  return getTaskNoteUiState(task) === "error" ? "Retry Save" : "Save Note";
}

function getTaskNotePlaceholder() {
  if (!hasLoadedStatuses) {
    return "Waiting for the first sync...";
  }

  if (!noteColumnAvailable) {
    return "Run the latest Supabase SQL migration to enable notes.";
  }

  return "Add an optional note for this floor.";
}

function syncTaskNoteUi(task) {
  const row = boardEl.querySelector(`[data-task-key="${task.taskKey}"]`);
  if (!row) {
    return;
  }

  const saveButton = row.querySelector("[data-note-save]");
  const noteStatus = row.querySelector("[data-note-state]");
  const noteToggle = row.querySelector("[data-note-toggle]");

  if (saveButton) {
    saveButton.disabled = !canSaveTaskNote(task);
    saveButton.textContent = getTaskNoteButtonLabel(task);
  }

  if (noteToggle) {
    noteToggle.disabled = !canToggleTaskNote(task);
    noteToggle.textContent = getTaskNoteToggleLabel(task);
    noteToggle.setAttribute("aria-expanded", String(isTaskNoteEditorOpen(task)));
  }

  if (noteStatus) {
    const statusInfo = getTaskNoteStatusInfo(task);
    noteStatus.className = statusInfo.className;
    noteStatus.textContent = statusInfo.label;
  }
}

function renderTaskRow(task) {
  const owner = ownerMeta[task.owner];
  const state = getTaskState(task);
  const displayedNote = getDisplayedTaskNote(task);
  const noteStatusInfo = getTaskNoteStatusInfo(task);
  const noteOpen = isTaskNoteEditorOpen(task);
  const hasNote = taskHasNote(task);
  const notePreview = getTaskNotePreview(task);
  const noteDisabled = !hasLoadedStatuses || !noteColumnAvailable;

  return `
    <div class="task-row is-${state}${hasNote ? " has-note" : ""}" data-task-key="${escapeHtml(task.taskKey)}">
      <div class="task-row-main">
        <div class="task-primary">
          <div class="task-summary">
            <span class="task-floor">${escapeHtml(task.floor)}</span>
            ${PAGE_OWNER ? "" : `<span class="who-badge ${owner.badgeClass}">${owner.label}</span>`}
            <span class="task-flow">to xlsx</span>
          </div>
          ${hasNote && !noteOpen ? `
            <div class="task-note-preview" title="${escapeHtml(notePreview)}">
              <span class="task-note-kicker">Note</span>
              <p>${escapeHtml(notePreview)}</p>
            </div>
          ` : ""}
        </div>

        <div class="task-actions">
          <button
            type="button"
            class="note-toggle-btn${hasNote ? " has-content" : ""}"
            data-note-toggle
            onclick="toggleNoteEditor(${task.idx})"
            ${canToggleTaskNote(task) ? "" : "disabled"}
            aria-expanded="${noteOpen ? "true" : "false"}"
            aria-controls="note-panel-${task.idx}"
          >${escapeHtml(getTaskNoteToggleLabel(task))}</button>
          <button
            type="button"
            class="status-btn ${stateClass[state]}"
            onclick="cycleStatus(${task.idx})"
            ${hasLoadedStatuses ? "" : "disabled"}
            aria-label="Change status for ${escapeHtml(task.building)} ${escapeHtml(task.floor)}"
          >${stateLabel[state]}</button>
        </div>
      </div>

      ${noteOpen ? `
        <div class="note-panel" id="note-panel-${task.idx}">
          <div class="note-panel-head">
            <label class="note-label" for="task-note-${task.idx}">Floor note</label>
            <span class="note-hint">Optional</span>
          </div>
          <textarea
            id="task-note-${task.idx}"
            class="note-input"
            rows="3"
            placeholder="${escapeHtml(getTaskNotePlaceholder())}"
            oninput="updateNoteDraft(event, ${task.idx})"
            onkeydown="handleNoteKeydown(event, ${task.idx})"
            ${noteDisabled ? "disabled" : ""}
          >${escapeHtml(displayedNote)}</textarea>

          <div class="note-toolbar">
            <span class="${noteStatusInfo.className}" data-note-state>${escapeHtml(noteStatusInfo.label)}</span>
            <button
              type="button"
              class="note-save-btn"
              data-note-save
              onclick="saveNote(${task.idx})"
              ${canSaveTaskNote(task) ? "" : "disabled"}
            >${escapeHtml(getTaskNoteButtonLabel(task))}</button>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderBoard() {
  const groups = buildTaskGroups(getVisibleTasks());
  const byEst = { 1: [], 2: [] };

  groups.forEach((group) => {
    byEst[group.est].push(group);
  });

  let html = "";

  [1, 2].forEach((est) => {
    if (!byEst[est].length) {
      return;
    }

    html += `<section class="est-section"><div class="est-label">EST ${est}</div><div class="grid">`;

    byEst[est].forEach((group) => {
      html += `
        <article class="card building-card ${getGroupCardClass(group)}">
          <div class="building-card-head">
            <div class="building-card-copy">
              <span class="est-tag">EST ${group.est} / Writing</span>
              <h2 class="bname">${escapeHtml(group.building)}</h2>
              ${getGroupHighlightsHtml(group)}
            </div>
            ${getGroupMetaHtml(group)}
          </div>

          <div class="building-task-list">
            ${group.items.map((task) => renderTaskRow(task)).join("")}
          </div>
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

function getNoteGuidance() {
  return "Run the latest supabase_setup.sql to enable per-floor notes for every task.";
}

function getSelectableColumns() {
  const columns = ["id", "status"];

  if (taskKeyColumnAvailable) {
    columns.push("task_key");
  }

  if (noteColumnAvailable) {
    columns.push("note");
  }

  return columns.join(",");
}

async function selectTaskRows() {
  const fullResponse = await sb.from("task_statuses").select("id,status,task_key,note").order("id");
  if (!fullResponse.error) {
    return { ...fullResponse, hasTaskKeyColumn: true, hasNoteColumn: true };
  }

  const taskKeyResponse = await sb.from("task_statuses").select("id,status,task_key").order("id");
  if (!taskKeyResponse.error) {
    return { ...taskKeyResponse, hasTaskKeyColumn: true, hasNoteColumn: false };
  }

  const basicResponse = await sb.from("task_statuses").select("id,status").order("id");
  if (!basicResponse.error) {
    return { ...basicResponse, hasTaskKeyColumn: false, hasNoteColumn: false };
  }

  return { data: null, error: fullResponse.error, hasTaskKeyColumn: false, hasNoteColumn: false };
}

function buildCapabilitiesWarning(rows) {
  const matchedTaskKeys = rows.filter((row) => typeof row.task_key === "string" && knownTaskKeys.has(row.task_key)).length;

  if (!rows.length) {
    return getSetupGuidance();
  }

  if (rows.length < EXPECTED_TASK_COUNT) {
    return `Loaded ${rows.length} visible rows for ${EXPECTED_TASK_COUNT} tasks. Seed the missing rows in Supabase and confirm anon select/update policies exist.`;
  }

  const messages = [];

  if (!taskKeyColumnAvailable) {
    messages.push(`${getTaskKeyGuidance()} The dashboard is still running on legacy numeric IDs.`);
  } else if (matchedTaskKeys < EXPECTED_TASK_COUNT) {
    messages.push(`Loaded ${matchedTaskKeys} stable task keys for ${EXPECTED_TASK_COUNT} tasks. ${getTaskKeyGuidance()}`);
  }

  if (!noteColumnAvailable) {
    messages.push(getNoteGuidance());
  }

  return messages.join(" ");
}

async function loadStatuses() {
  setDot("saving");
  clearTaskData();
  hasLoadedStatuses = false;

  const { data, error, hasTaskKeyColumn, hasNoteColumn } = await selectTaskRows();

  taskKeyColumnAvailable = hasTaskKeyColumn;
  noteColumnAvailable = hasNoteColumn;

  if (error) {
    setWarning(`Could not load task statuses from Supabase: ${error.message}`);
    setDot("red");
    render();
    return;
  }

  const rows = Array.isArray(data) ? data : [];
  idMode = detectIdMode(rows);

  rows.forEach((row) => {
    applyRowData(row);
  });

  const capabilitiesWarning = buildCapabilitiesWarning(rows);
  if (capabilitiesWarning) {
    setWarning(capabilitiesWarning);
  } else {
    clearWarning();
  }

  hasLoadedStatuses = true;
  setDot("ok");
  render();
}

async function persistTaskByTaskKey(task, patch) {
  const { data, error } = await sb
    .from("task_statuses")
    .update(patch)
    .eq("task_key", task.taskKey)
    .select(getSelectableColumns());

  if (error) {
    return { ok: false, error, needsLegacyFallback: true };
  }

  if (Array.isArray(data) && data.length > 0) {
    inferIdModeFromRowId(data[0].id);
    applyRowData(data[0]);
    return { ok: true, row: data[0] };
  }

  return { ok: false, needsLegacyFallback: true };
}

async function persistTaskByLegacyId(task, patch) {
  let lastError = null;

  for (const dbId of getLegacyWriteIds(task)) {
    const { data, error } = await sb
      .from("task_statuses")
      .update(patch)
      .eq("id", dbId)
      .select(getSelectableColumns());

    if (error) {
      lastError = error;
      continue;
    }

    if (Array.isArray(data) && data.length > 0) {
      inferIdModeFromRowId(data[0].id);
      applyRowData(data[0]);
      return { ok: true, row: data[0] };
    }
  }

  return { ok: false, error: lastError };
}

async function persistStatus(task, nextState) {
  if (taskKeyColumnAvailable) {
    const taskKeyResult = await persistTaskByTaskKey(task, { status: nextState });
    if (taskKeyResult.ok || !taskKeyResult.needsLegacyFallback) {
      return taskKeyResult;
    }
  }

  return persistTaskByLegacyId(task, { status: nextState });
}

async function persistNote(task, nextNote) {
  if (!noteColumnAvailable) {
    return { ok: false, noteUnavailable: true };
  }

  if (taskKeyColumnAvailable) {
    const taskKeyResult = await persistTaskByTaskKey(task, { note: nextNote });
    if (taskKeyResult.ok || !taskKeyResult.needsLegacyFallback) {
      return taskKeyResult;
    }
  }

  return persistTaskByLegacyId(task, { note: nextNote });
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
  const snapshot = captureTaskStatusSnapshot(task);

  setOptimisticTaskStatus(task, next);
  render();
  setDot("saving");

  const result = await persistStatus(task, next);

  if (result.ok) {
    clearTransientWarning();
    setDot("ok");
    render();
    return;
  }

  restoreTaskStatusSnapshot(snapshot);
  setWarning(`Save failed for "${task.building} / ${task.floor}". Check the row visibility, RLS policies, and run the updated supabase_setup.sql so task_key values stay aligned with each floor.`);
  setDot("red");
  render();
}

function updateNoteDraft(event, taskIdx) {
  const task = tasks[taskIdx];
  if (!task) {
    return;
  }

  noteDraftsByKey[task.taskKey] = normalizeNoteValue(event.target.value);

  if (noteDraftsByKey[task.taskKey] === getPersistedTaskNote(task)) {
    dirtyNoteKeys.delete(task.taskKey);
    if (noteUiStateByKey[task.taskKey] !== "saving") {
      noteUiStateByKey[task.taskKey] = "idle";
    }
  } else {
    dirtyNoteKeys.add(task.taskKey);
    noteUiStateByKey[task.taskKey] = "dirty";
  }

  syncTaskNoteUi(task);
}

function handleNoteKeydown(event, taskIdx) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    saveNote(taskIdx);
  }
}

function toggleNoteEditor(taskIdx) {
  if (!hasLoadedStatuses) {
    setWarning("Please wait for the dashboard to finish syncing before editing a note.");
    render();
    return;
  }

  if (!noteColumnAvailable) {
    setWarning(getNoteGuidance());
    render();
    return;
  }

  const task = tasks[taskIdx];
  if (!task) {
    return;
  }

  if (noteEditorOpenKeys.has(task.taskKey)) {
    noteEditorOpenKeys.delete(task.taskKey);
  } else {
    noteEditorOpenKeys.add(task.taskKey);
  }

  clearTransientWarning();
  render();
}

async function saveNote(taskIdx) {
  if (!hasLoadedStatuses) {
    setWarning("Please wait for the dashboard to finish syncing before saving a note.");
    render();
    return;
  }

  if (!noteColumnAvailable) {
    setWarning(getNoteGuidance());
    render();
    return;
  }

  const task = tasks[taskIdx];
  if (!task) {
    return;
  }

  const nextNote = getDisplayedTaskNote(task);

  noteUiStateByKey[task.taskKey] = "saving";
  syncTaskNoteUi(task);
  setDot("saving");

  const result = await persistNote(task, nextNote);

  if (result.ok) {
    dirtyNoteKeys.delete(task.taskKey);
    noteDraftsByKey[task.taskKey] = nextNote;
    noteUiStateByKey[task.taskKey] = "saved";
    clearTransientWarning();
    setDot("ok");
    render();
    return;
  }

  noteUiStateByKey[task.taskKey] = "error";
  setWarning(`Note save failed for "${task.building} / ${task.floor}". ${result.noteUnavailable ? getNoteGuidance() : "Check Supabase update access and try again."}`);
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
      applyRowData(payload.new);
      render();
      return;
    }

    if (Number.isInteger(payload?.new?.id)) {
      inferIdModeFromRowId(payload.new.id);
      applyRowData(payload.new);
      render();
    }
  })
  .subscribe();

window.cycleStatus = cycleStatus;
window.updateNoteDraft = updateNoteDraft;
window.handleNoteKeydown = handleNoteKeydown;
window.toggleNoteEditor = toggleNoteEditor;
window.saveNote = saveNote;

render();
loadStatuses();
