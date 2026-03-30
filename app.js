const SUPABASE_URL = "https://ijiniarsesgpaismytow.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaW5pYXJzZXNncGFpc215dG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTU2OTUsImV4cCI6MjA5MDM3MTY5NX0.C-IC3ppIycKi0NgUGEhkhfSIaieRT85iDh-0uuwR-Ko";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const PAGE_MODE = document.body.dataset.view || "admin";
const DEFAULT_VIEWER = document.body.dataset.user || "admin";
const VIEWER_PARAM = new URLSearchParams(window.location.search).get("user");
const REQUESTED_VIEWER = PAGE_MODE === "member" ? (VIEWER_PARAM || DEFAULT_VIEWER) : DEFAULT_VIEWER;

const { pathLabel: DEFAULT_PATH_LABEL, members: DEFAULT_MEMBER_SEED, buildSeedTasks } = window.DASHBOARD_DEFAULTS;
const DEFAULT_TASK_SEED = buildSeedTasks();

const BACKEND_PREVIEW = "preview";
const BACKEND_SUPABASE = "supabase";
const MEMBER_STORAGE_KEY = "task-est-preview-members-v4";
const TASK_STORAGE_KEY = "task-est-preview-tasks-v4";
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

const iconMap = {
  todo: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 7.5v5l3 2"></path>
    </svg>
  `,
  wip: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21 12a9 9 0 1 1-3.16-6.86"></path>
      <path d="M21 3v6h-6"></path>
    </svg>
  `,
  done: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="m8.5 12 2.5 2.5L16 9.5"></path>
    </svg>
  `,
  note: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20h9"></path>
      <path d="m16.5 3.5 4 4"></path>
      <path d="M18.5 1.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"></path>
    </svg>
  `,
  missing: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m10.29 3.86-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.71-3.14l-8-14a2 2 0 0 0-3.42 0Z"></path>
      <path d="M12 9v4"></path>
      <circle cx="12" cy="17" r="1"></circle>
    </svg>
  `,
  save: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3v12"></path>
      <path d="m7 10 5 5 5-5"></path>
      <path d="M5 21h14"></path>
    </svg>
  `
};

function getIconSvg(iconName) {
  return iconMap[iconName] || "";
}

function getStatusIconName(status) {
  return status === "wip" ? "wip" : status === "done" ? "done" : "todo";
}

function renderButtonContent(iconName, label) {
  return `
    <span class="btn-shell">
      <span class="btn-icon" aria-hidden="true">${getIconSvg(iconName)}</span>
      <span class="btn-label" data-btn-label>${escapeHtml(label)}</span>
    </span>
  `;
}

const roleMeta = {
  admin: { label: "Admin", eyebrow: "Admin View" },
  lead: { label: "Lead", eyebrow: "Lead View" },
  member: { label: "Member", eyebrow: "Member View" }
};

const accentPalette = {
  accent: { solid: "#0f766e", strong: "#115e59", soft: "rgba(15, 118, 110, 0.12)" },
  momen: { solid: "#0f9f6e", strong: "#0b7d56", soft: "rgba(15, 159, 110, 0.14)" },
  sarah: { solid: "#d9485f", strong: "#be314d", soft: "rgba(217, 72, 95, 0.12)" },
  hossam: { solid: "#2563eb", strong: "#1d4ed8", soft: "rgba(37, 99, 235, 0.12)" },
  ayman: { solid: "#d97706", strong: "#b45309", soft: "rgba(217, 119, 6, 0.14)" },
  amany: { solid: "#0891b2", strong: "#0e7490", soft: "rgba(8, 145, 178, 0.13)" },
  asmaa: { solid: "#dc2626", strong: "#b91c1c", soft: "rgba(220, 38, 38, 0.13)" },
  omar: { solid: "#4f46e5", strong: "#4338ca", soft: "rgba(79, 70, 229, 0.13)" },
  hosary: { solid: "#7c3aed", strong: "#6d28d9", soft: "rgba(124, 58, 237, 0.13)" },
  mahmoud: { solid: "#0f766e", strong: "#0f5b51", soft: "rgba(15, 118, 110, 0.12)" },
  "momen-abdelshafy": { solid: "#475569", strong: "#334155", soft: "rgba(71, 85, 105, 0.13)" }
};

const state = {
  backend: "loading",
  missingSupported: true,
  currentUserSlug: REQUESTED_VIEWER,
  currentUser: null,
  members: [],
  tasks: [],
  activeStatus: null,
  loaded: false,
  warningMessage: "",
  modeMessage: "",
  memberEditorSlug: null,
  taskEditorId: null,
  adminPanelOpen: false,
  adminPanelTab: "people",
  noteDraftsById: {},
  noteUiStateById: {},
  noteEditorOpenIds: new Set(),
  syncChannels: [],
  isReloading: false
};

const eyebrowEl = document.getElementById("page-eyebrow");
const titleEl = document.getElementById("page-title");
const subtitleEl = document.getElementById("page-subtitle");
const navEl = document.getElementById("page-nav");
const pathEl = document.getElementById("page-path");
const statsEl = document.getElementById("stats");
const boardEl = document.getElementById("board");
const dotEl = document.getElementById("dot");
const syncLabelEl = document.getElementById("sync-label");
const warningEl = document.getElementById("db-warning");
const managementRootEl = document.getElementById("management-root");
const filterButtons = Array.from(document.querySelectorAll("[data-status-filter]"));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hasOwn(map, key) {
  return Object.prototype.hasOwnProperty.call(map, key);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeNoteValue(value) {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n") : "";
}

function cloneMember(member) {
  return {
    slug: member.slug,
    display_name: member.display_name || member.name || "",
    role: member.role || "member",
    manager_slug: member.manager_slug || null,
    accent_key: member.accent_key || "accent",
    sort_order: Number.isFinite(Number(member.sort_order)) ? Number(member.sort_order) : 0,
    active: member.active !== false
  };
}

function cloneTask(task) {
  return {
    id: Number(task.id),
    est: Number(task.est) || 1,
    building: String(task.building || "").trim(),
    floor_name: String(task.floor_name || "").trim(),
    owner: String(task.owner || "").trim(),
    status: stateOrder.includes(task.status) ? task.status : "todo",
    note: normalizeNoteValue(task.note),
    missing: Boolean(task.missing),
    task_key: String(task.task_key || "")
  };
}

function getSeedMembers() {
  return DEFAULT_MEMBER_SEED.map((member) => cloneMember(member));
}

function getSeedTasks() {
  return DEFAULT_TASK_SEED.map((task) => cloneTask(task));
}

function readLocalJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensurePreviewSeed() {
  const storedMembers = readLocalJson(MEMBER_STORAGE_KEY, []);
  const storedTasks = readLocalJson(TASK_STORAGE_KEY, []);

  if (!storedMembers.length) {
    writeLocalJson(MEMBER_STORAGE_KEY, getSeedMembers());
  }

  if (!storedTasks.length) {
    writeLocalJson(TASK_STORAGE_KEY, getSeedTasks());
  }
}

function setDot(status) {
  dotEl.className = "dot " + (status === "ok" ? "green" : status === "saving" ? "orange" : "red");
  syncLabelEl.textContent =
    status === "ok" ? "Synced" :
    status === "saving" ? "Saving..." :
    "Connection issue";
}

function renderWarning() {
  const message = [state.modeMessage, state.warningMessage].filter(Boolean).join(" ");
  warningEl.textContent = message;
  warningEl.classList.toggle("is-hidden", !message);
}

function setWarning(message) {
  state.warningMessage = message;
  renderWarning();
}

function clearWarning() {
  state.warningMessage = "";
  renderWarning();
}

function setModeMessage(message) {
  state.modeMessage = message;
  renderWarning();
}

function clearTransientWarning() {
  if (
    state.warningMessage.startsWith("Save failed") ||
    state.warningMessage.startsWith("Note save failed") ||
    state.warningMessage.startsWith("Please wait") ||
    state.warningMessage.startsWith("Could not")
  ) {
    clearWarning();
  }
}

function getAccent(key) {
  return accentPalette[key] || accentPalette.accent;
}

function getMemberBySlug(slug) {
  return state.members.find((member) => member.slug === slug) || null;
}

function getDisplayName(memberOrSlug) {
  const member = typeof memberOrSlug === "string" ? getMemberBySlug(memberOrSlug) : memberOrSlug;
  return member?.display_name || member?.name || "Unknown";
}

function getShortName(memberOrSlug) {
  const displayName = getDisplayName(memberOrSlug);
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || displayName;
  const duplicateFirstNames = getActiveMembers().filter((member) => {
    const memberFirst = getDisplayName(member).trim().split(/\s+/)[0] || "";
    return memberFirst === firstName;
  });

  if (duplicateFirstNames.length > 1 && parts.length > 1) {
    return `${firstName} ${parts[1]}`;
  }

  return firstName || displayName;
}

function getActiveMembers() {
  return state.members.filter((member) => member.active !== false);
}

function sortMembers(members) {
  const roleOrder = { admin: 0, lead: 1, member: 2 };

  return [...members].sort((left, right) => {
    const sortDelta = (left.sort_order ?? 0) - (right.sort_order ?? 0);
    if (sortDelta !== 0) {
      return sortDelta;
    }

    const roleDelta = (roleOrder[left.role] ?? 9) - (roleOrder[right.role] ?? 9);
    if (roleDelta !== 0) {
      return roleDelta;
    }

    return getDisplayName(left).localeCompare(getDisplayName(right));
  });
}

function sortTasks(tasks) {
  return [...tasks].sort((left, right) => {
    if (left.est !== right.est) {
      return left.est - right.est;
    }

    const buildingDelta = left.building.localeCompare(right.building);
    if (buildingDelta !== 0) {
      return buildingDelta;
    }

    const unitDelta = left.floor_name.localeCompare(right.floor_name);
    if (unitDelta !== 0) {
      return unitDelta;
    }

    return left.id - right.id;
  });
}

function getChildrenOf(slug) {
  return state.members.filter((member) => member.manager_slug === slug);
}

function getDescendantSlugs(slug) {
  const descendants = [];
  const stack = getChildrenOf(slug).map((member) => member.slug);

  while (stack.length) {
    const current = stack.pop();
    descendants.push(current);
    getChildrenOf(current).forEach((member) => {
      stack.push(member.slug);
    });
  }

  return descendants;
}

function isAdmin() {
  return state.currentUser?.role === "admin";
}

function isLead() {
  return state.currentUser?.role === "lead";
}

function getVisibleMemberSlugs() {
  if (!state.currentUser) {
    return new Set();
  }

  if (state.currentUser.role === "admin") {
    return new Set(getActiveMembers().map((member) => member.slug));
  }

  const visible = new Set([state.currentUser.slug]);
  getDescendantSlugs(state.currentUser.slug).forEach((slug) => visible.add(slug));
  return visible;
}

function getScopedMembers() {
  const visible = getVisibleMemberSlugs();
  return getActiveMembers().filter((member) => visible.has(member.slug) && member.slug !== state.currentUser?.slug);
}

function getScopedTasks() {
  const visible = getVisibleMemberSlugs();
  return state.tasks.filter((task) => visible.has(task.owner));
}

function getVisibleTasks() {
  const tasks = getScopedTasks();

  return state.activeStatus
    ? tasks.filter((task) => task.status === state.activeStatus)
    : tasks;
}

function resolveCurrentUser() {
  const directMatch = getMemberBySlug(state.currentUserSlug);
  if (directMatch) {
    return directMatch;
  }

  if (PAGE_MODE === "admin") {
    return cloneMember({ slug: "admin", display_name: "Admin", role: "admin", accent_key: "accent", manager_slug: null, sort_order: -1, active: true });
  }

  return getActiveMembers().find((member) => member.role !== "admin") || cloneMember({
    slug: state.currentUserSlug,
    display_name: state.currentUserSlug,
    role: "member",
    accent_key: "accent",
    manager_slug: null,
    sort_order: 999,
    active: true
  });
}

function applyTheme() {
  const accent = getAccent(state.currentUser?.accent_key || "accent");
  document.body.style.setProperty("--accent", accent.solid);
  document.body.style.setProperty("--accent-soft", accent.soft);
  document.body.style.setProperty("--accent-strong", accent.strong);
}

function getPageCopy() {
  const user = state.currentUser;
  const role = roleMeta[user?.role] || roleMeta.member;

  if (!user) {
    return {
      eyebrow: "Loading",
      title: "Conversion Dashboard",
      subtitle: "Loading dashboard data..."
    };
  }

  if (user.role === "admin") {
    return {
      eyebrow: role.eyebrow,
      title: "Hierarchy Dashboard",
      subtitle: "See every lead and member, manage people and tasks, and track what is done across March 2026."
    };
  }

  if (user.role === "lead") {
    return {
      eyebrow: role.eyebrow,
      title: `${getDisplayName(user)} Dashboard`,
      subtitle: "This page shows your own work plus everyone assigned under your team."
    };
  }

  return {
    eyebrow: role.eyebrow,
    title: `${getDisplayName(user)} Dashboard`,
    subtitle: "This page only shows tasks assigned directly to you."
  };
}

function renderPageHeader() {
  const copy = getPageCopy();

  eyebrowEl.textContent = copy.eyebrow;
  titleEl.textContent = copy.title;
  subtitleEl.textContent = copy.subtitle;
  pathEl.textContent = DEFAULT_PATH_LABEL;
}

function renderPageNav() {
  const links = [];
  const currentUser = state.currentUser;

  if (isAdmin()) {
    links.push(`<a class="page-link ${PAGE_MODE === "admin" ? "is-active" : ""}" href="/">Admin</a>`);

    getActiveMembers()
      .filter((member) => member.role !== "admin")
      .forEach((member) => {
        const active = PAGE_MODE === "member" && member.slug === currentUser?.slug;
        links.push(
          `<a class="page-link ${active ? "is-active" : ""}" href="/member/?user=${encodeURIComponent(member.slug)}">${escapeHtml(getShortName(member))}</a>`
        );
      });
  } else if (isLead()) {
    const visibleLeadScopeSlugs = new Set([currentUser?.slug, ...getDescendantSlugs(currentUser?.slug)]);
    const visibleLeadScope = sortMembers(
      getActiveMembers().filter((member) => {
        return visibleLeadScopeSlugs.has(member.slug);
      })
    );

    visibleLeadScope.forEach((member) => {
      const active = member.slug === currentUser?.slug;
      links.push(
        `<a class="page-link ${active ? "is-active" : ""}" href="/member/?user=${encodeURIComponent(member.slug)}">${escapeHtml(getShortName(member))}</a>`
      );
    });
  } else if (currentUser) {
    links.push(
      `<a class="page-link is-active" href="/member/?user=${encodeURIComponent(currentUser.slug)}">${escapeHtml(getShortName(currentUser))}</a>`
    );
  }

  navEl.innerHTML = links.join("");
}

function renderStats() {
  const scopedTasks = getScopedTasks();
  const totals = { todo: 0, wip: 0, done: 0 };

  scopedTasks.forEach((task) => {
    totals[task.status] += 1;
  });

  let cards = [];

  if (isAdmin()) {
    const leads = getActiveMembers().filter((member) => member.role === "lead").length;
    const members = getActiveMembers().filter((member) => member.role === "member").length;

    cards = [
      { value: scopedTasks.length, label: "Visible Tasks", tone: "tone-accent" },
      { value: leads, label: "Team Leads", tone: "tone-accent" },
      { value: members, label: "Members", tone: "tone-accent" },
      { value: totals.todo, label: "To Do", tone: "tone-todo" },
      { value: totals.wip, label: "In Progress", tone: "tone-wip" },
      { value: totals.done, label: "Done", tone: "tone-done" }
    ];
  } else if (isLead()) {
    cards = [
      { value: scopedTasks.length, label: "Team Tasks", tone: "tone-accent" },
      { value: getScopedMembers().length, label: "People In Scope", tone: "tone-accent" },
      { value: totals.todo, label: "To Do", tone: "tone-todo" },
      { value: totals.wip, label: "In Progress", tone: "tone-wip" },
      { value: totals.done, label: "Done", tone: "tone-done" }
    ];
  } else {
    cards = [
      { value: scopedTasks.length, label: "Assigned Tasks", tone: "tone-accent" },
      { value: totals.todo, label: "To Do", tone: "tone-todo" },
      { value: totals.wip, label: "In Progress", tone: "tone-wip" },
      { value: totals.done, label: "Done", tone: "tone-done" }
    ];
  }

  statsEl.innerHTML = cards.map((card) => `
    <div class="stat-card ${card.tone}">
      <strong>${card.value}</strong>
      <span>${escapeHtml(card.label)}</span>
    </div>
  `).join("");
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", state.activeStatus === button.dataset.statusFilter);
    button.setAttribute("aria-pressed", String(state.activeStatus === button.dataset.statusFilter));
  });
}

function toggleStatusFilter(status) {
  state.activeStatus = state.activeStatus === status ? null : status;
  render();
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
        noteCount: 0,
        missingCount: 0
      });
    }

    const group = groups.get(key);
    group.items.push(task);
    group.owners.add(task.owner);
    group.totals[task.status] += 1;
    if (taskHasNote(task)) {
      group.noteCount += 1;
    }
    if (task.missing) {
      group.missingCount += 1;
    }
  });

  return Array.from(groups.values()).sort((left, right) => left.building.localeCompare(right.building));
}

function renderMemberBadge(slug) {
  const member = getMemberBySlug(slug);
  const accent = getAccent(member?.accent_key);
  return `
    <span class="who-badge who-badge-dynamic" style="--badge-bg:${accent.soft}; --badge-fg:${accent.solid}">
      ${escapeHtml(getShortName(member))}
    </span>
  `;
}

function getGroupAccent(group) {
  const owners = Array.from(group.owners);
  if (owners.length === 1) {
    const member = getMemberBySlug(owners[0]);
    return getAccent(member?.accent_key);
  }

  return getAccent(state.currentUser?.accent_key || "accent");
}

function getGroupStateChipsHtml(group) {
  return stateOrder
    .filter((status) => group.totals[status] > 0)
    .map((status) => `<span class="summary-chip is-${status}">${group.totals[status]} ${escapeHtml(stateLabel[status])}</span>`)
    .join("");
}

function getGroupHighlightsHtml(group) {
  const itemLabel = `${group.items.length} ${group.items.length === 1 ? "Item" : "Items"}`;
  const noteLabel = group.noteCount === 1 ? "1 Note" : `${group.noteCount} Notes`;
  const missingLabel = group.missingCount === 1 ? "1 Missing" : `${group.missingCount} Missing`;

  return `
    <div class="building-highlights">
      <span class="summary-chip">${itemLabel}</span>
      ${group.noteCount ? `<span class="summary-chip">${noteLabel}</span>` : ""}
      ${group.missingCount ? `<span class="summary-chip is-missing">${missingLabel}</span>` : ""}
      ${getGroupStateChipsHtml(group)}
    </div>
  `;
}

function getGroupMetaHtml(group) {
  const orderedOwners = Array.from(group.owners)
    .sort((left, right) => getDisplayName(left).localeCompare(getDisplayName(right)));

  if (state.currentUser?.role === "member") {
    return `<div class="building-meta">${renderMemberBadge(state.currentUser.slug)}</div>`;
  }

  return `
    <div class="building-meta">
      <div class="owner-stack">
        ${orderedOwners.map((slug) => renderMemberBadge(slug)).join("")}
      </div>
    </div>
  `;
}

function getTaskById(taskId) {
  return state.tasks.find((task) => task.id === Number(taskId)) || null;
}

function getTaskNoteUiState(task) {
  return state.noteUiStateById[task.id] || "idle";
}

function getDisplayedTaskNote(task) {
  return hasOwn(state.noteDraftsById, task.id) ? state.noteDraftsById[task.id] : normalizeNoteValue(task.note);
}

function isTaskNoteDirty(task) {
  return getDisplayedTaskNote(task) !== normalizeNoteValue(task.note);
}

function taskHasNote(task) {
  return Boolean(getDisplayedTaskNote(task).trim() || normalizeNoteValue(task.note).trim());
}

function getTaskNotePreview(task) {
  return (getDisplayedTaskNote(task).trim() || normalizeNoteValue(task.note).trim()).replace(/\s+/g, " ");
}

function isTaskNoteEditorOpen(task) {
  const uiState = getTaskNoteUiState(task);
  return state.noteEditorOpenIds.has(task.id) || uiState === "saving" || uiState === "error" || isTaskNoteDirty(task);
}

function canToggleTaskNote(task) {
  return state.loaded && getTaskNoteUiState(task) !== "saving";
}

function getTaskNoteToggleLabel(task) {
  if (!state.loaded) {
    return "Syncing";
  }

  if (getTaskNoteUiState(task) === "saving") {
    return "Saving...";
  }

  if (isTaskNoteDirty(task)) {
    return "Editing";
  }

  if (isTaskNoteEditorOpen(task)) {
    return "Hide note";
  }

  return taskHasNote(task) ? "Edit note" : "Add note";
}

function getTaskNoteStatusInfo(task) {
  if (!state.loaded) {
    return { label: "Waiting for sync...", className: "note-status is-muted" };
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

  return task.note
    ? { label: "Saved on board", className: "note-status is-idle" }
    : { label: "Optional", className: "note-status is-idle" };
}

function canSaveTaskNote(task) {
  return state.loaded && (isTaskNoteDirty(task) || getTaskNoteUiState(task) === "error");
}

function getTaskNoteButtonLabel(task) {
  return getTaskNoteUiState(task) === "error" ? "Retry Save" : "Save Note";
}

function getTaskNotePlaceholder() {
  return state.loaded ? "Add an optional note for this item." : "Waiting for the first sync...";
}

function taskIsMissing(task) {
  return Boolean(task.missing);
}

function canToggleTaskMissing() {
  return isAdmin() && state.loaded && state.missingSupported;
}

function getTaskMissingToggleLabel(task) {
  return taskIsMissing(task) ? "Clear missing" : "Mark missing";
}

function setButtonLabel(button, label) {
  const labelEl = button?.querySelector("[data-btn-label]");
  if (labelEl) {
    labelEl.textContent = label;
    return;
  }

  if (button) {
    button.textContent = label;
  }
}

function shouldShowAssigneeBadge(task) {
  if (!state.currentUser) {
    return false;
  }

  return state.currentUser.role !== "member" || task.owner !== state.currentUser.slug || getVisibleMemberSlugs().size > 1;
}

function syncTaskNoteUi(task) {
  const row = boardEl.querySelector(`[data-task-id="${task.id}"]`);
  if (!row) {
    return;
  }

  const saveButton = row.querySelector("[data-note-save]");
  const noteStatus = row.querySelector("[data-note-state]");
  const noteToggle = row.querySelector("[data-note-toggle]");

  if (saveButton) {
    saveButton.disabled = !canSaveTaskNote(task);
    setButtonLabel(saveButton, getTaskNoteButtonLabel(task));
  }

  if (noteStatus) {
    const statusInfo = getTaskNoteStatusInfo(task);
    noteStatus.className = statusInfo.className;
    noteStatus.textContent = statusInfo.label;
  }

  if (noteToggle) {
    noteToggle.disabled = !canToggleTaskNote(task);
    setButtonLabel(noteToggle, getTaskNoteToggleLabel(task));
    noteToggle.setAttribute("aria-expanded", String(isTaskNoteEditorOpen(task)));
  }
}

function renderTaskRow(task) {
  const assignee = getMemberBySlug(task.owner);
  const noteStatusInfo = getTaskNoteStatusInfo(task);
  const noteOpen = isTaskNoteEditorOpen(task);
  const hasNote = taskHasNote(task);
  const notePreview = getTaskNotePreview(task);
  const missing = taskIsMissing(task);

  return `
    <div class="task-row is-${task.status}${hasNote ? " has-note" : ""}${missing ? " is-missing" : ""}" data-task-id="${task.id}">
      <div class="task-row-main">
        <div class="task-primary">
          <div class="task-summary">
            <span class="task-floor">${escapeHtml(task.floor_name)}</span>
            ${shouldShowAssigneeBadge(task) ? renderMemberBadge(task.owner) : ""}
            ${missing ? `<span class="task-missing-chip">Missing</span>` : ""}
          </div>
          ${hasNote && !noteOpen ? `
            <div class="task-note-preview" title="${escapeHtml(notePreview)}">
              <span class="task-note-kicker">Note</span>
              <p>${escapeHtml(notePreview)}</p>
            </div>
          ` : ""}
        </div>

        <div class="task-actions${isAdmin() ? " is-admin" : ""}">
          ${isAdmin() ? `
            <button
              type="button"
              class="task-action-btn missing-toggle-btn${missing ? " is-active" : ""}"
              onclick="toggleMissing(${task.id})"
              ${canToggleTaskMissing() ? "" : "disabled"}
              aria-pressed="${missing ? "true" : "false"}"
              aria-label="${escapeHtml(missing ? `Remove missing flag from ${task.building} ${task.floor_name}` : `Mark ${task.building} ${task.floor_name} as missing`)}"
              title="${escapeHtml(state.missingSupported ? getTaskMissingToggleLabel(task) : "Missing flag needs SQL support")}"
            >${renderButtonContent("missing", missing ? "Clear missing" : "Mark missing")}</button>
          ` : ""}
          <button
            type="button"
            class="task-action-btn note-toggle-btn${hasNote ? " has-content" : ""}"
            data-note-toggle
            onclick="toggleNoteEditor(${task.id})"
            ${canToggleTaskNote(task) ? "" : "disabled"}
            aria-expanded="${noteOpen ? "true" : "false"}"
            aria-controls="note-panel-${task.id}"
          >${renderButtonContent("note", getTaskNoteToggleLabel(task))}</button>
          <button
            type="button"
            class="task-action-btn status-btn ${stateClass[task.status]}"
            onclick="cycleStatus(${task.id})"
            ${state.loaded ? "" : "disabled"}
            aria-label="Change status for ${escapeHtml(task.building)} ${escapeHtml(task.floor_name)}"
          >${renderButtonContent(getStatusIconName(task.status), stateLabel[task.status])}</button>
        </div>
      </div>

      ${noteOpen ? `
        <div class="note-panel" id="note-panel-${task.id}">
          <div class="note-panel-head">
            <label class="note-label" for="task-note-${task.id}">Task note</label>
            <span class="note-hint">${escapeHtml(getDisplayName(assignee))}</span>
          </div>
          <textarea
            id="task-note-${task.id}"
            class="note-input"
            rows="3"
            placeholder="${escapeHtml(getTaskNotePlaceholder())}"
            oninput="updateNoteDraft(event, ${task.id})"
            onkeydown="handleNoteKeydown(event, ${task.id})"
          >${escapeHtml(getDisplayedTaskNote(task))}</textarea>
          <div class="note-toolbar">
            <span class="${noteStatusInfo.className}" data-note-state>${escapeHtml(noteStatusInfo.label)}</span>
            <button
              type="button"
              class="note-save-btn"
              data-note-save
              onclick="saveNote(${task.id})"
              ${canSaveTaskNote(task) ? "" : "disabled"}
            >${renderButtonContent("save", getTaskNoteButtonLabel(task))}</button>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderBoard() {
  const groups = buildTaskGroups(getVisibleTasks());
  const estGroups = new Map();

  groups.forEach((group) => {
    if (!estGroups.has(group.est)) {
      estGroups.set(group.est, []);
    }

    estGroups.get(group.est).push(group);
  });

  const sections = Array.from(estGroups.keys())
    .sort((left, right) => left - right)
    .map((est) => {
      const cards = estGroups.get(est).map((group) => {
        const accent = getGroupAccent(group);

        return `
          <article class="card building-card" style="--card-accent:${accent.solid}; --card-accent-soft:${accent.soft}; --card-accent-strong:${accent.strong}">
            <div class="building-card-head">
              <div class="building-card-copy">
                <span class="est-tag">EST ${group.est}</span>
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
      }).join("");

      return `
        <section class="est-section">
          <div class="est-label">EST ${est}</div>
          <div class="grid">${cards}</div>
        </section>
      `;
    });

  boardEl.innerHTML = sections.length
    ? sections.join("")
    : `<div class="empty-state">No tasks match the current filter.</div>`;
}

function getAccentOptions(selectedKey) {
  return Object.keys(accentPalette).map((key) => `
    <option value="${escapeHtml(key)}" ${selectedKey === key ? "selected" : ""}>${escapeHtml(key.replace(/-/g, " "))}</option>
  `).join("");
}

function getManagerOptions(selectedSlug, editingSlug) {
  return [
    `<option value="">No manager</option>`,
    ...getActiveMembers()
      .filter((member) => member.slug !== editingSlug)
      .map((member) => `<option value="${escapeHtml(member.slug)}" ${selectedSlug === member.slug ? "selected" : ""}>${escapeHtml(getDisplayName(member))}</option>`)
  ].join("");
}

function getAssigneeOptions(selectedSlug) {
  return getActiveMembers()
    .filter((member) => member.role !== "admin")
    .map((member) => `<option value="${escapeHtml(member.slug)}" ${selectedSlug === member.slug ? "selected" : ""}>${escapeHtml(getDisplayName(member))}</option>`)
    .join("");
}

function getTaskEditorValue() {
  return state.taskEditorId ? getTaskById(state.taskEditorId) : null;
}

function getMemberEditorValue() {
  return state.memberEditorSlug ? getMemberBySlug(state.memberEditorSlug) : null;
}

function openAdminPanel(tab = state.adminPanelTab || "people", resetEditor = false) {
  if (!isAdmin()) {
    return;
  }

  state.adminPanelTab = tab === "tasks" ? "tasks" : "people";
  state.adminPanelOpen = true;

  if (resetEditor) {
    if (state.adminPanelTab === "people") {
      state.memberEditorSlug = null;
    } else {
      state.taskEditorId = null;
    }
  }

  render();
}

function closeAdminPanel() {
  if (!state.adminPanelOpen) {
    return;
  }

  state.adminPanelOpen = false;
  render();
}

function switchAdminPanelTab(tab) {
  if (!isAdmin()) {
    return;
  }

  state.adminPanelTab = tab === "tasks" ? "tasks" : "people";
  state.adminPanelOpen = true;
  render();
}

function handleAdminModalBackdrop(event) {
  if (event.target === event.currentTarget) {
    closeAdminPanel();
  }
}

function renderMemberAdminPanel(editingMember, members) {
  return `
    <div class="admin-modal-panel-grid">
      <article class="admin-card admin-editor-card">
        <div class="panel-head">
          <div>
            <span class="panel-kicker">People</span>
            <h3 class="panel-title">${editingMember ? "Edit Team Member" : "Add Team Member"}</h3>
            <p class="panel-sub">${editingMember ? `Update ${escapeHtml(getDisplayName(editingMember))} and save when you are ready.` : "Create a new person, set their role, then place them under the right manager."}</p>
          </div>
          <button type="button" class="ghost-btn" onclick="resetMemberForm()">New person</button>
        </div>

        <form class="admin-form" onsubmit="saveMemberFromForm(event)">
          <div class="form-grid">
            <label class="field">
              <span>Name</span>
              <input name="display_name" type="text" value="${escapeHtml(editingMember?.display_name || "")}" placeholder="Mahmoud Feid" required>
            </label>

            <label class="field">
              <span>Slug</span>
              <input name="slug" type="text" value="${escapeHtml(editingMember?.slug || "")}" placeholder="mahmoud-feid" ${editingMember ? "readonly" : ""} required>
            </label>

            <label class="field">
              <span>Role</span>
              <select name="role">
                ${["admin", "lead", "member"].map((role) => `<option value="${role}" ${(editingMember?.role || "member") === role ? "selected" : ""}>${escapeHtml(role)}</option>`).join("")}
              </select>
            </label>

            <label class="field">
              <span>Manager</span>
              <select name="manager_slug">
                ${getManagerOptions(editingMember?.manager_slug || "", editingMember?.slug || "")}
              </select>
            </label>

            <label class="field field-wide">
              <span>Accent</span>
              <select name="accent_key">
                ${getAccentOptions(editingMember?.accent_key || "accent")}
              </select>
            </label>
          </div>

          <div class="inline-actions">
            <button type="submit" class="primary-btn">${editingMember ? "Save member" : "Add member"}</button>
            <button type="button" class="ghost-btn" onclick="resetMemberForm()">Clear</button>
          </div>
        </form>
      </article>

      <article class="admin-card admin-list-card">
        <div class="panel-head">
          <div>
            <span class="panel-kicker">Directory</span>
            <h3 class="panel-title">Active Team</h3>
            <p class="panel-sub">${members.length} people currently available in the dashboard.</p>
          </div>
        </div>

        <div class="admin-list">
          ${members.map((member) => `
            <div class="admin-row">
              <div class="admin-row-copy">
                <strong>${escapeHtml(getDisplayName(member))}</strong>
                <span>${escapeHtml(member.role)}${member.manager_slug ? ` - reports to ${escapeHtml(getDisplayName(member.manager_slug))}` : ""}</span>
              </div>
              <div class="admin-row-actions">
                <button type="button" class="ghost-btn" onclick="editMember('${member.slug}')">Edit</button>
                <button type="button" class="danger-btn" onclick="deleteMember('${member.slug}')">Delete</button>
              </div>
            </div>
          `).join("")}
        </div>
      </article>
    </div>
  `;
}

function renderTaskAdminPanel(editingTask, tasks) {
  return `
    <div class="admin-modal-panel-grid admin-modal-panel-grid-wide">
      <article class="admin-card admin-editor-card">
        <div class="panel-head">
          <div>
            <span class="panel-kicker">Tasks</span>
            <h3 class="panel-title">${editingTask ? "Edit Task" : "Add Task"}</h3>
            <p class="panel-sub">${editingTask ? `Update EST ${editingTask.est} / ${escapeHtml(editingTask.building)} / ${escapeHtml(editingTask.floor_name)}.` : "Create a new March task and assign it directly from the popup."}</p>
          </div>
          <button type="button" class="ghost-btn" onclick="resetTaskForm()">New task</button>
        </div>

        <form class="admin-form" onsubmit="saveTaskFromForm(event)">
          <div class="form-grid">
            <label class="field">
              <span>EST</span>
              <select name="est">
                <option value="1" ${(editingTask?.est || 1) === 1 ? "selected" : ""}>EST 1</option>
                <option value="2" ${(editingTask?.est || 1) === 2 ? "selected" : ""}>EST 2</option>
              </select>
            </label>

            <label class="field field-wide">
              <span>Building</span>
              <input name="building" type="text" value="${escapeHtml(editingTask?.building || "")}" placeholder="Future - Engineering" required>
            </label>

            <label class="field field-wide">
              <span>Unit / Floor</span>
              <input name="floor_name" type="text" value="${escapeHtml(editingTask?.floor_name || "")}" placeholder="Ground / School name / 1st floor" required>
            </label>

            <label class="field">
              <span>Assignee</span>
              <select name="owner">
                ${getAssigneeOptions(editingTask?.owner || "")}
              </select>
            </label>

            <label class="field">
              <span>Status</span>
              <select name="status">
                ${stateOrder.map((status) => `<option value="${status}" ${(editingTask?.status || "todo") === status ? "selected" : ""}>${escapeHtml(stateLabel[status])}</option>`).join("")}
              </select>
            </label>

            <label class="field field-wide">
              <span>Note</span>
              <textarea name="note" rows="3" placeholder="Optional note">${escapeHtml(editingTask?.note || "")}</textarea>
            </label>

            <label class="checkbox-field field-wide">
              <input name="missing" type="checkbox" ${editingTask?.missing ? "checked" : ""}>
              <span>Mark this unit as missing</span>
            </label>
          </div>

          <div class="inline-actions">
            <button type="submit" class="primary-btn">${editingTask ? "Save task" : "Add task"}</button>
            <button type="button" class="ghost-btn" onclick="resetTaskForm()">Clear</button>
          </div>
        </form>
      </article>

      <article class="admin-card admin-list-card">
        <div class="panel-head">
          <div>
            <span class="panel-kicker">Inventory</span>
            <h3 class="panel-title">March Tasks</h3>
            <p class="panel-sub">${tasks.length} tasks currently available across EST 1 and EST 2.</p>
          </div>
        </div>

        <div class="admin-list task-list">
          ${tasks.map((task) => `
            <div class="admin-row">
              <div class="admin-row-copy">
                <strong>EST ${task.est} - ${escapeHtml(task.building)} - ${escapeHtml(task.floor_name)}</strong>
                <span>${escapeHtml(getDisplayName(task.owner))} - ${escapeHtml(stateLabel[task.status])}${task.missing ? " - Missing" : ""}</span>
              </div>
              <div class="admin-row-actions">
                <button type="button" class="ghost-btn" onclick="editTaskFromAdmin(${task.id})">Edit</button>
                <button type="button" class="danger-btn" onclick="deleteTask(${task.id})">Delete</button>
              </div>
            </div>
          `).join("")}
        </div>
      </article>
    </div>
  `;
}

function renderAdminTools() {
  if (!managementRootEl) {
    return;
  }

  if (!isAdmin()) {
    document.body.classList.remove("modal-open");
    state.adminPanelOpen = false;
    managementRootEl.innerHTML = "";
    managementRootEl.classList.add("is-hidden");
    return;
  }

  managementRootEl.classList.remove("is-hidden");
  document.body.classList.toggle("modal-open", state.adminPanelOpen);

  const editingMember = getMemberEditorValue();
  const editingTask = getTaskEditorValue();
  const members = getActiveMembers();
  const tasks = sortTasks(state.tasks);
  const leads = members.filter((member) => member.role === "lead").length;
  const memberCount = members.filter((member) => member.role === "member").length;
  const activePanel = state.adminPanelTab === "tasks"
    ? renderTaskAdminPanel(editingTask, tasks)
    : renderMemberAdminPanel(editingMember, members);
  const modalTitle = state.adminPanelTab === "tasks" ? "Task Workspace" : "People Workspace";
  const modalCopy = state.adminPanelTab === "tasks"
    ? "Add new March units, reassign work, and keep the task list tidy without crowding the dashboard."
    : "Manage roles, reporting lines, and the active team from one focused admin popup.";

  managementRootEl.innerHTML = `
    <section class="admin-launcher">
      <div class="admin-launcher-copy">
        <div>
          <span class="panel-kicker">Admin Workspace</span>
          <h2 class="admin-launcher-title">Quick actions for people and tasks</h2>
          <p class="panel-sub">Keep the board clean, then open a focused popup only when you need to manage the system.</p>
        </div>

        <div class="admin-mini-stats" aria-label="Admin summary">
          <div class="admin-mini-stat">
            <strong>${leads}</strong>
            <span>Leads</span>
          </div>
          <div class="admin-mini-stat">
            <strong>${memberCount}</strong>
            <span>Members</span>
          </div>
          <div class="admin-mini-stat">
            <strong>${tasks.length}</strong>
            <span>Tasks</span>
          </div>
        </div>
      </div>

      <div class="admin-launcher-actions">
        <button type="button" class="primary-btn" onclick="openAdminPanel('people', true)">New person</button>
        <button type="button" class="primary-btn" onclick="openAdminPanel('tasks', true)">New task</button>
        <button type="button" class="ghost-btn" onclick="openAdminPanel('people')">Manage team</button>
        <button type="button" class="ghost-btn" onclick="openAdminPanel('tasks')">Manage tasks</button>
        <button type="button" class="ghost-btn" onclick="seedDefaultData()">Load March 2026 Seed</button>
      </div>
    </section>

    ${state.adminPanelOpen ? `
      <div class="admin-modal-backdrop" onclick="handleAdminModalBackdrop(event)">
        <section class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
          <div class="admin-modal-shell">
            <aside class="admin-modal-sidebar">
              <span class="panel-kicker">Manage Team And Tasks</span>
              <h2 class="admin-modal-title" id="admin-modal-title">${modalTitle}</h2>
              <p class="panel-sub admin-modal-sub">${modalCopy}</p>

              <div class="admin-modal-tabs" role="tablist" aria-label="Admin sections">
                <button type="button" class="admin-tab-btn ${state.adminPanelTab === "people" ? "is-active" : ""}" onclick="switchAdminPanelTab('people')">People</button>
                <button type="button" class="admin-tab-btn ${state.adminPanelTab === "tasks" ? "is-active" : ""}" onclick="switchAdminPanelTab('tasks')">Tasks</button>
              </div>

              <div class="admin-modal-note">
                ${state.adminPanelTab === "people"
                  ? (editingMember ? `Editing ${escapeHtml(getDisplayName(editingMember))}.` : "Ready to add a new team member.")
                  : (editingTask ? `Editing EST ${editingTask.est} - ${escapeHtml(editingTask.building)} - ${escapeHtml(editingTask.floor_name)}.` : "Ready to add a new task.")}
              </div>
            </aside>

            <div class="admin-modal-content">
              <div class="admin-modal-topbar">
                <div>
                  <span class="panel-kicker">${state.adminPanelTab === "people" ? "Team Editor" : "Task Editor"}</span>
                  <h3 class="panel-title">${state.adminPanelTab === "people" ? "People Management" : "Task Management"}</h3>
                  <p class="panel-sub">${state.adminPanelTab === "people" ? "Edit roles, names, and reporting structure without pushing the board down." : "Create, edit, and review March assignments in one dedicated popup."}</p>
                </div>
                <button type="button" class="ghost-btn admin-close-btn" onclick="closeAdminPanel()">Close</button>
              </div>

              ${activePanel}
            </div>
          </div>
        </section>
      </div>
    ` : ""}
  `;
}

function render() {
  renderWarning();
  renderPageHeader();
  renderPageNav();
  renderStats();
  updateFilterButtons();
  renderAdminTools();
  renderBoard();
}

function buildPreviewMessage() {
  return "Preview mode is active. Changes are stored in this browser only until you run the latest supabase_setup.sql. March 2026 hierarchy and assignments are seeded locally so everyone can review the latest distribution.";
}

async function detectBackend() {
  try {
    const { error } = await sb.from("team_members").select("slug").limit(1);
    return error ? BACKEND_PREVIEW : BACKEND_SUPABASE;
  } catch {
    return BACKEND_PREVIEW;
  }
}

async function loadPreviewData() {
  ensurePreviewSeed();
  state.missingSupported = true;

  return {
    members: sortMembers(readLocalJson(MEMBER_STORAGE_KEY, getSeedMembers()).map((member) => cloneMember(member))),
    tasks: sortTasks(readLocalJson(TASK_STORAGE_KEY, getSeedTasks()).map((task) => cloneTask(task)))
  };
}

async function loadRemoteData() {
  const taskFieldsBase = "id,task_key,est,building,floor_name,owner,status,note";
  let remoteTasksResponse = await sb.from("task_statuses")
    .select(`${taskFieldsBase},missing`)
    .order("id", { ascending: true });

  if (remoteTasksResponse.error) {
    remoteTasksResponse = await sb.from("task_statuses")
      .select(taskFieldsBase)
      .order("id", { ascending: true });

    state.missingSupported = false;
  } else {
    state.missingSupported = true;
  }

  const [membersResponse, tasksResponse] = await Promise.all([
    sb.from("team_members")
      .select("slug,display_name,role,manager_slug,accent_key,sort_order,active")
      .order("sort_order", { ascending: true })
      .order("display_name", { ascending: true }),
    Promise.resolve(remoteTasksResponse)
  ]);

  if (membersResponse.error) {
    throw membersResponse.error;
  }

  if (tasksResponse.error) {
    throw tasksResponse.error;
  }

  return {
    members: sortMembers((membersResponse.data || []).map((member) => cloneMember(member))),
    tasks: sortTasks((tasksResponse.data || []).map((task) => cloneTask(task)))
  };
}

function pruneEphemeralTaskState() {
  const validIds = new Set(state.tasks.map((task) => Number(task.id)));

  Object.keys(state.noteDraftsById).forEach((key) => {
    if (!validIds.has(Number(key))) {
      delete state.noteDraftsById[key];
    }
  });

  Object.keys(state.noteUiStateById).forEach((key) => {
    if (!validIds.has(Number(key))) {
      delete state.noteUiStateById[key];
    }
  });

  Array.from(state.noteEditorOpenIds).forEach((taskId) => {
    if (!validIds.has(Number(taskId))) {
      state.noteEditorOpenIds.delete(taskId);
    }
  });
}

function applyLoadedPayload(payload) {
  state.members = payload.members;
  state.tasks = payload.tasks;
  state.currentUser = resolveCurrentUser();
  state.loaded = true;

  pruneEphemeralTaskState();
  applyTheme();
  setModeMessage(state.backend === BACKEND_PREVIEW ? buildPreviewMessage() : "");
  clearTransientWarning();
  render();
}

async function loadAllData() {
  if (state.isReloading) {
    return;
  }

  state.isReloading = true;
  setDot("saving");

  try {
    const payload = state.backend === BACKEND_SUPABASE
      ? await loadRemoteData()
      : await loadPreviewData();

    applyLoadedPayload(payload);
    setDot("ok");
  } catch (error) {
    if (state.backend === BACKEND_SUPABASE) {
      state.backend = BACKEND_PREVIEW;
      setWarning(`Could not load the live hierarchy from Supabase: ${error.message}. Falling back to local preview data.`);

      try {
        const previewPayload = await loadPreviewData();
        applyLoadedPayload(previewPayload);
        setDot("ok");
        return;
      } catch (previewError) {
        setWarning(`Could not load preview data after Supabase fallback: ${previewError.message}`);
        setDot("red");
        return;
      }
    }

    setWarning(`Could not load preview data: ${error.message}`);
    setDot("red");
  } finally {
    state.isReloading = false;
  }
}

function persistPreviewSnapshot() {
  writeLocalJson(MEMBER_STORAGE_KEY, state.members);
  writeLocalJson(TASK_STORAGE_KEY, state.tasks);
}

function getNextTaskId() {
  return state.tasks.reduce((maxId, task) => Math.max(maxId, Number(task.id) || 0), 0) + 1;
}

function generateTaskKey(fields, excludeTaskId) {
  const baseKey = `${fields.est}__${slugify(fields.building)}__${slugify(fields.floor_name)}__${slugify(fields.owner)}`;
  let candidate = baseKey;
  let suffix = 2;

  while (state.tasks.some((task) => task.task_key === candidate && task.id !== excludeTaskId)) {
    candidate = `${baseKey}--${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function saveMember(member) {
  const payload = {
    slug: member.slug,
    display_name: member.display_name,
    role: member.role,
    manager_slug: member.role === "admin" ? null : member.manager_slug,
    accent_key: member.accent_key,
    sort_order: member.sort_order,
    active: true
  };

  if (state.backend === BACKEND_PREVIEW) {
    const existingIndex = state.members.findIndex((entry) => entry.slug === payload.slug);
    if (existingIndex >= 0) {
      state.members.splice(existingIndex, 1, cloneMember(payload));
    } else {
      state.members.push(cloneMember(payload));
    }

    state.members = sortMembers(state.members);
    persistPreviewSnapshot();
    return;
  }

  const { error } = await sb.from("team_members").upsert(payload, { onConflict: "slug" });
  if (error) {
    throw error;
  }
}

async function deleteMemberBySlug(slug) {
  if (slug === "admin") {
    throw new Error("The root admin account cannot be deleted.");
  }

  if (state.members.some((member) => member.manager_slug === slug)) {
    throw new Error("Reassign or delete this member's reports first.");
  }

  if (state.tasks.some((task) => task.owner === slug)) {
    throw new Error("Reassign this member's tasks before deleting them.");
  }

  if (state.backend === BACKEND_PREVIEW) {
    state.members = state.members.filter((member) => member.slug !== slug);
    persistPreviewSnapshot();
    return;
  }

  const { error } = await sb.from("team_members").delete().eq("slug", slug);
  if (error) {
    throw error;
  }
}

async function saveTask(task) {
  const payload = {
    id: Number(task.id),
    est: Number(task.est),
    building: task.building.trim(),
    floor_name: task.floor_name.trim(),
    owner: task.owner,
    status: stateOrder.includes(task.status) ? task.status : "todo",
    note: normalizeNoteValue(task.note),
    task_key: task.task_key
  };

  if (state.backend === BACKEND_PREVIEW || state.missingSupported) {
    payload.missing = Boolean(task.missing);
  }

  if (state.backend === BACKEND_PREVIEW) {
    const existingIndex = state.tasks.findIndex((entry) => entry.id === payload.id);
    if (existingIndex >= 0) {
      state.tasks.splice(existingIndex, 1, cloneTask(payload));
    } else {
      state.tasks.push(cloneTask(payload));
    }

    state.tasks = sortTasks(state.tasks);
    persistPreviewSnapshot();
    return;
  }

  const isExisting = state.tasks.some((entry) => entry.id === payload.id);
  const response = isExisting
    ? await sb.from("task_statuses").update(payload).eq("id", payload.id)
    : await sb.from("task_statuses").insert(payload);

  if (response.error) {
    throw response.error;
  }
}

async function deleteTaskById(taskId) {
  if (state.backend === BACKEND_PREVIEW) {
    state.tasks = state.tasks.filter((task) => task.id !== taskId);
    persistPreviewSnapshot();
    return;
  }

  const { error } = await sb.from("task_statuses").delete().eq("id", taskId);
  if (error) {
    throw error;
  }
}

async function updateTaskPatch(taskId, patch) {
  const task = getTaskById(taskId);
  if (!task) {
    throw new Error("Task not found.");
  }

  const nextTask = cloneTask({ ...task, ...patch });
  await saveTask(nextTask);
}

async function seedDefaultData() {
  if (!window.confirm("This will load the March 2026 hierarchy seed for people and tasks. Continue?")) {
    return;
  }

  try {
    setDot("saving");

    if (state.backend === BACKEND_PREVIEW) {
      state.members = sortMembers(getSeedMembers());
      state.tasks = sortTasks(getSeedTasks());
      persistPreviewSnapshot();
    } else {
      const seedMembers = getSeedMembers();
      const seedTasks = getSeedTasks();
      const existingTasksByKey = new Map(state.tasks.map((task) => [task.task_key, task]));
      let nextTaskId = getNextTaskId();

      const normalizedTasks = seedTasks.map((task) => {
        const existing = existingTasksByKey.get(task.task_key);
        if (existing) {
          return {
            ...task,
            id: existing.id,
            note: existing.note,
            status: existing.status
          };
        }

        return {
          ...task,
          id: nextTaskId++
        };
      });

      const { error: membersError } = await sb.from("team_members").upsert(seedMembers, { onConflict: "slug" });
      if (membersError) {
        throw membersError;
      }

      for (const task of normalizedTasks) {
        const existing = existingTasksByKey.get(task.task_key);
        if (existing) {
          const { error } = await sb.from("task_statuses").update(task).eq("id", existing.id);
          if (error) {
            throw error;
          }
        } else {
          const { error } = await sb.from("task_statuses").insert(task);
          if (error) {
            throw error;
          }
        }
      }
    }

    await loadAllData();
    setWarning("March 2026 seed loaded.");
    setDot("ok");
  } catch (error) {
    setWarning(`Could not load the March seed: ${error.message}`);
    setDot("red");
  }
}

function validateMemberPayload(payload) {
  const display_name = String(payload.display_name || "").trim();
  const slug = slugify(payload.slug || display_name);
  const role = payload.role;
  const manager_slug = payload.manager_slug || null;
  const accent_key = payload.accent_key || "accent";
  const editingExisting = Boolean(state.memberEditorSlug);

  if (!display_name) {
    throw new Error("Member name is required.");
  }

  if (!slug) {
    throw new Error("Member slug is required.");
  }

  if (!["admin", "lead", "member"].includes(role)) {
    throw new Error("Role is required.");
  }

  if (!editingExisting && state.members.some((member) => member.slug === slug)) {
    throw new Error("That slug already exists.");
  }

  if (role !== "admin" && !manager_slug) {
    throw new Error("Non-admin users need a manager.");
  }

  if (manager_slug === slug) {
    throw new Error("A user cannot manage themselves.");
  }

  let currentManager = manager_slug;
  while (currentManager) {
    if (currentManager === slug) {
      throw new Error("That manager would create a reporting cycle.");
    }

    currentManager = getMemberBySlug(currentManager)?.manager_slug || null;
  }

  return {
    slug,
    display_name,
    role,
    manager_slug: role === "admin" ? null : manager_slug,
    accent_key,
    sort_order: editingExisting
      ? (getMemberBySlug(state.memberEditorSlug)?.sort_order ?? state.members.length * 10)
      : (state.members.length + 1) * 10,
    active: true
  };
}

function validateTaskPayload(payload) {
  const est = Number(payload.est);
  const building = String(payload.building || "").trim();
  const floor_name = String(payload.floor_name || "").trim();
  const owner = String(payload.owner || "").trim();
  const status = stateOrder.includes(payload.status) ? payload.status : "todo";
  const note = normalizeNoteValue(payload.note);
  const editingTask = getTaskEditorValue();
  const id = editingTask ? editingTask.id : getNextTaskId();
  const missing = payload.missing == null
    ? Boolean(editingTask?.missing)
    : payload.missing === true || payload.missing === "true" || payload.missing === "on";

  if (![1, 2].includes(est)) {
    throw new Error("EST must be 1 or 2.");
  }

  if (!building) {
    throw new Error("Building is required.");
  }

  if (!floor_name) {
    throw new Error("Unit / floor is required.");
  }

  if (!getMemberBySlug(owner)) {
    throw new Error("Choose a valid assignee.");
  }

  return {
    id,
    est,
    building,
    floor_name,
    owner,
    status,
    note,
    missing,
    task_key: generateTaskKey({ est, building, floor_name, owner }, editingTask?.id || null)
  };
}

async function saveMemberFromForm(event) {
  event.preventDefault();

  try {
    clearTransientWarning();
    setDot("saving");

    const formData = new FormData(event.currentTarget);
    const payload = validateMemberPayload({
      display_name: formData.get("display_name"),
      slug: formData.get("slug"),
      role: formData.get("role"),
      manager_slug: formData.get("manager_slug"),
      accent_key: formData.get("accent_key")
    });

    await saveMember(payload);
    state.memberEditorSlug = null;
    await loadAllData();
    setWarning(`Saved ${payload.display_name}.`);
  } catch (error) {
    setWarning(`Save failed: ${error.message}`);
    setDot("red");
  }
}

function editMember(slug) {
  state.memberEditorSlug = slug;
  state.adminPanelTab = "people";
  state.adminPanelOpen = true;
  render();
}

function resetMemberForm() {
  state.memberEditorSlug = null;
  state.adminPanelTab = "people";
  state.adminPanelOpen = true;
  render();
}

async function deleteMember(slug) {
  const member = getMemberBySlug(slug);
  if (!member) {
    return;
  }

  if (!window.confirm(`Delete ${getDisplayName(member)}? This cannot be undone.`)) {
    return;
  }

  try {
    clearTransientWarning();
    setDot("saving");
    await deleteMemberBySlug(slug);
    if (state.memberEditorSlug === slug) {
      state.memberEditorSlug = null;
    }
    await loadAllData();
    setWarning(`${getDisplayName(member)} was removed.`);
  } catch (error) {
    setWarning(`Could not delete member: ${error.message}`);
    setDot("red");
  }
}

async function saveTaskFromForm(event) {
  event.preventDefault();

  try {
    clearTransientWarning();
    setDot("saving");

    const formData = new FormData(event.currentTarget);
    const payload = validateTaskPayload({
      est: formData.get("est"),
      building: formData.get("building"),
      floor_name: formData.get("floor_name"),
      owner: formData.get("owner"),
      status: formData.get("status"),
      note: formData.get("note"),
      missing: formData.get("missing")
    });

    await saveTask(payload);
    state.taskEditorId = null;
    await loadAllData();
    setWarning(`Saved ${payload.building} - ${payload.floor_name}.`);
  } catch (error) {
    setWarning(`Save failed: ${error.message}`);
    setDot("red");
  }
}

function editTaskFromAdmin(taskId) {
  state.taskEditorId = Number(taskId);
  state.adminPanelTab = "tasks";
  state.adminPanelOpen = true;
  render();
}

function resetTaskForm() {
  state.taskEditorId = null;
  state.adminPanelTab = "tasks";
  state.adminPanelOpen = true;
  render();
}

async function deleteTask(taskId) {
  const task = getTaskById(taskId);
  if (!task) {
    return;
  }

  if (!window.confirm(`Delete ${task.building} - ${task.floor_name}?`)) {
    return;
  }

  try {
    clearTransientWarning();
    setDot("saving");
    await deleteTaskById(Number(taskId));
    if (state.taskEditorId === Number(taskId)) {
      state.taskEditorId = null;
    }
    await loadAllData();
    setWarning(`${task.building} - ${task.floor_name} was removed.`);
  } catch (error) {
    setWarning(`Could not delete task: ${error.message}`);
    setDot("red");
  }
}

function updateNoteDraft(event, taskId) {
  const task = getTaskById(taskId);
  if (!task) {
    return;
  }

  state.noteDraftsById[task.id] = normalizeNoteValue(event.target.value);
  state.noteUiStateById[task.id] = isTaskNoteDirty(task) ? "dirty" : "idle";
  syncTaskNoteUi(task);
}

function handleNoteKeydown(event, taskId) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveNote(taskId);
  }
}

function toggleNoteEditor(taskId) {
  const task = getTaskById(taskId);
  if (!task || !canToggleTaskNote(task)) {
    return;
  }

  if (state.noteEditorOpenIds.has(task.id)) {
    if (!isTaskNoteDirty(task) && !["saving", "error"].includes(getTaskNoteUiState(task))) {
      state.noteEditorOpenIds.delete(task.id);
    }
  } else {
    state.noteEditorOpenIds.add(task.id);
  }

  render();

  if (state.noteEditorOpenIds.has(task.id)) {
    window.setTimeout(() => {
      document.getElementById(`task-note-${task.id}`)?.focus();
    }, 0);
  }
}

async function saveNote(taskId) {
  const task = getTaskById(taskId);
  if (!task || !state.loaded) {
    return;
  }

  if (!isTaskNoteDirty(task) && getTaskNoteUiState(task) !== "error") {
    return;
  }

  state.noteUiStateById[task.id] = "saving";
  syncTaskNoteUi(task);
  setDot("saving");

  try {
    await updateTaskPatch(task.id, { note: getDisplayedTaskNote(task) });
    delete state.noteDraftsById[task.id];
    state.noteUiStateById[task.id] = "saved";
    await loadAllData();
  } catch (error) {
    state.noteUiStateById[task.id] = "error";
    syncTaskNoteUi(task);
    setWarning(`Note save failed: ${error.message}`);
    setDot("red");
  }
}

async function cycleStatus(taskId) {
  const task = getTaskById(taskId);
  if (!task || !state.loaded) {
    return;
  }

  const currentIndex = stateOrder.indexOf(task.status);
  const nextStatus = stateOrder[(currentIndex + 1) % stateOrder.length];

  try {
    clearTransientWarning();
    setDot("saving");
    await updateTaskPatch(task.id, { status: nextStatus });
    await loadAllData();
  } catch (error) {
    setWarning(`Save failed: ${error.message}`);
    setDot("red");
  }
}

async function toggleMissing(taskId) {
  const task = getTaskById(taskId);
  if (!task || !canToggleTaskMissing()) {
    return;
  }

  try {
    clearTransientWarning();
    setDot("saving");
    await updateTaskPatch(task.id, { missing: !taskIsMissing(task) });
    await loadAllData();
  } catch (error) {
    setWarning(`Save failed: ${error.message}`);
    setDot("red");
  }
}

function bindFilterButtons() {
  filterButtons.forEach((button) => {
    const status = button.dataset.statusFilter;
    if (status && stateLabel[status]) {
      button.innerHTML = renderButtonContent(getStatusIconName(status), stateLabel[status]);
      button.setAttribute("aria-label", stateLabel[status]);
    }

    if (button.dataset.bound === "true") {
      return;
    }

    button.dataset.bound = "true";
    button.addEventListener("click", () => toggleStatusFilter(button.dataset.statusFilter));
  });
}

function bindGlobalKeyboardShortcuts() {
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.adminPanelOpen) {
      closeAdminPanel();
    }
  });
}

function scheduleRealtimeReload() {
  window.clearTimeout(state.reloadTimer);
  state.reloadTimer = window.setTimeout(() => {
    void loadAllData();
  }, 180);
}

async function teardownRealtime() {
  const channels = [...state.syncChannels];
  state.syncChannels = [];

  await Promise.all(channels.map((channel) => sb.removeChannel(channel)));
}

function bindRealtime() {
  if (state.backend !== BACKEND_SUPABASE) {
    return;
  }

  ["team_members", "task_statuses"].forEach((table) => {
    const channel = sb
      .channel(`dashboard-${table}-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        scheduleRealtimeReload();
      })
      .subscribe();

    state.syncChannels.push(channel);
  });
}

async function init() {
  bindFilterButtons();
  bindGlobalKeyboardShortcuts();
  setDot("saving");

  try {
    state.backend = await detectBackend();
    await loadAllData();
    await teardownRealtime();
    bindRealtime();
  } catch (error) {
    setWarning(`Startup failed: ${error.message}`);
    setDot("red");
  }
}

window.seedDefaultData = seedDefaultData;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.switchAdminPanelTab = switchAdminPanelTab;
window.handleAdminModalBackdrop = handleAdminModalBackdrop;
window.saveMemberFromForm = saveMemberFromForm;
window.editMember = editMember;
window.resetMemberForm = resetMemberForm;
window.deleteMember = deleteMember;
window.saveTaskFromForm = saveTaskFromForm;
window.editTaskFromAdmin = editTaskFromAdmin;
window.resetTaskForm = resetTaskForm;
window.deleteTask = deleteTask;
window.updateNoteDraft = updateNoteDraft;
window.handleNoteKeydown = handleNoteKeydown;
window.toggleNoteEditor = toggleNoteEditor;
window.saveNote = saveNote;
window.cycleStatus = cycleStatus;
window.toggleMissing = toggleMissing;

void init();
