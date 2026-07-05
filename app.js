const bandDefaults = [
  { id: "red", label: "Red", color: "#cf3742", start: 0, weight: 0 },
  { id: "orange", label: "Orange", color: "#df7a20", start: 6, weight: 1 },
  { id: "green", label: "Green", color: "#51b553", start: 8, weight: 3 },
  { id: "yellow", label: "Yellow", color: "#e0b522", start: 20, weight: 2 }
];

const commonZones = [
  "UTC",
  "Europe/London",
  "Europe/Stockholm",
  "Europe/Berlin",
  "Europe/Helsinki",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland"
];

const defaultParties = [
  { name: "Leo", zoneHint: "Stockholm" },
  { name: "Andrew", zoneHint: "New York" }
];

const friendlyAliases = [
  { keys: ["sweden", "swedish"], zone: "Europe/Stockholm", label: "Central European Time" },
  { keys: ["stockholm", "central european", "cet", "cest"], zone: "Europe/Stockholm", label: "Central European Time" },
  { keys: ["norway", "norwegian"], zone: "Europe/Oslo", label: "Central European Time" },
  { keys: ["denmark", "danish"], zone: "Europe/Copenhagen", label: "Central European Time" },
  { keys: ["finland", "finnish"], zone: "Europe/Helsinki", label: "Eastern European Time" },
  { keys: ["germany", "german"], zone: "Europe/Berlin", label: "Central European Time" },
  { keys: ["france", "french"], zone: "Europe/Paris", label: "Central European Time" },
  { keys: ["spain", "spanish"], zone: "Europe/Madrid", label: "Central European Time" },
  { keys: ["italy", "italian"], zone: "Europe/Rome", label: "Central European Time" },
  { keys: ["netherlands", "dutch"], zone: "Europe/Amsterdam", label: "Central European Time" },
  { keys: ["belgium", "belgian"], zone: "Europe/Brussels", label: "Central European Time" },
  { keys: ["poland", "polish"], zone: "Europe/Warsaw", label: "Central European Time" },
  { keys: ["austria", "austrian"], zone: "Europe/Vienna", label: "Central European Time" },
  { keys: ["switzerland", "swiss"], zone: "Europe/Zurich", label: "Central European Time" },
  { keys: ["portugal", "portuguese"], zone: "Europe/Lisbon", label: "Western European Time" },
  { keys: ["ireland", "irish"], zone: "Europe/Dublin", label: "Greenwich Mean Time" },
  { keys: ["uk", "britain", "united kingdom", "england"], zone: "Europe/London", label: "United Kingdom Time" },
  { keys: ["greece", "greek"], zone: "Europe/Athens", label: "Eastern European Time" },
  { keys: ["turkey", "turkish"], zone: "Europe/Istanbul", label: "Turkey Time" },
  { keys: ["egypt", "egyptian"], zone: "Africa/Cairo", label: "Eastern European Time" },
  { keys: ["south africa", "south african"], zone: "Africa/Johannesburg", label: "South Africa Time" },
  { keys: ["nigeria", "nigerian"], zone: "Africa/Lagos", label: "West Africa Time" },
  { keys: ["kenya", "kenyan"], zone: "Africa/Nairobi", label: "East Africa Time" },
  { keys: ["morocco", "moroccan"], zone: "Africa/Casablanca", label: "Western European Time" },
  { keys: ["united states", "usa", "us", "america"], zone: "America/New_York", label: "Eastern Time" },
  { keys: ["new york", "eastern", "est", "edt"], zone: "America/New_York", label: "Eastern Time" },
  { keys: ["chicago", "midwest", "central", "cst", "cdt"], zone: "America/Chicago", label: "Central Time" },
  { keys: ["california", "pacific", "pst", "pdt", "west coast"], zone: "America/Los_Angeles", label: "Pacific Time" },
  { keys: ["texas"], zone: "America/Chicago", label: "Central Time" },
  { keys: ["canada", "toronto", "ontario"], zone: "America/Toronto", label: "Eastern Time" },
  { keys: ["mexico"], zone: "America/Mexico_City", label: "Central Time" },
  { keys: ["brazil", "brazilian"], zone: "America/Sao_Paulo", label: "Brasilia Time" },
  { keys: ["argentina", "argentinian"], zone: "America/Argentina/Buenos_Aires", label: "Argentina Time" },
  { keys: ["chile", "chilean"], zone: "America/Santiago", label: "Chile Time" },
  { keys: ["india", "indian", "ist"], zone: "Asia/Kolkata", label: "India Standard Time" },
  { keys: ["pakistan", "pakistani"], zone: "Asia/Karachi", label: "Pakistan Standard Time" },
  { keys: ["bangladesh", "bangladeshi"], zone: "Asia/Dhaka", label: "Bangladesh Standard Time" },
  { keys: ["china", "chinese", "beijing"], zone: "Asia/Shanghai", label: "China Standard Time" },
  { keys: ["singapore"], zone: "Asia/Singapore", label: "Singapore Time" },
  { keys: ["japan", "japanese"], zone: "Asia/Tokyo", label: "Japan Standard Time" },
  { keys: ["korea", "south korea", "korean"], zone: "Asia/Seoul", label: "Korea Standard Time" },
  { keys: ["australia", "sydney", "new south wales"], zone: "Australia/Sydney", label: "Australian Eastern Time" },
  { keys: ["new zealand", "nz", "kiwi"], zone: "Pacific/Auckland", label: "New Zealand Time" }
];

const state = {
  parties: [],
  bands: structuredClone(bandDefaults),
  editingPartyId: null,
  allZones: [],
  zoneLookup: new Map(),
  normalizedZoneLookup: new Map(),
  activeModeMenuPartyId: null,
  longPressTimer: null,
  drag: null
};

const els = {
  meetingDate: document.querySelector("#meeting-date"),
  slider: document.querySelector("#time-slider"),
  utcOutput: document.querySelector("#utc-output"),
  partyForm: document.querySelector("#party-form"),
  partyName: document.querySelector("#party-name"),
  partyZone: document.querySelector("#party-zone"),
  partySubmit: document.querySelector("#party-submit"),
  partyCancel: document.querySelector("#party-cancel"),
  zoneHelp: document.querySelector("#zone-help"),
  zoneSuggestions: document.querySelector("#zone-suggestions"),
  partyList: document.querySelector("#party-list"),
  partyTemplate: document.querySelector("#party-item-template"),
  zoneDatalist: document.querySelector("#timezone-list"),
  bandEditor: document.querySelector("#band-editor"),
  modeMenu: document.querySelector("#party-mode-menu"),
  overallMeter: document.querySelector("#overall-meter"),
  overallLabel: document.querySelector("#overall-label")
};

init();

function init() {
  populateTimezoneList();
  seedDefaultParties();
  const today = new Date();
  els.meetingDate.value = today.toISOString().slice(0, 10);
  renderBandEditor();
  wireEvents();
  render();
}

function seedDefaultParties() {
  if (state.parties.length > 0) return;

  defaultParties.forEach((entry) => {
    const resolved = resolveTimeZoneInput(entry.zoneHint);
    if (!resolved) return;
    state.parties.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: entry.name,
      timeZone: resolved.zone,
      zoneDisplay: resolved.display,
      bandMode: "global",
      customBands: null,
      customEditorOpen: false
    });
  });
}

function wireEvents() {
  els.slider.addEventListener("input", render);
  els.meetingDate.addEventListener("input", render);

  document.addEventListener("click", (event) => {
    if (!event.target || !(event.target instanceof Node)) return;
    if (els.modeMenu.contains(event.target)) return;
    closePartyModeMenu();
  });

  document.addEventListener("pointermove", handleTimelinePointerMove);
  document.addEventListener("pointerup", stopTimelineDrag);
  document.addEventListener("pointercancel", stopTimelineDrag);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePartyModeMenu();
  });

  els.partyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    upsertParty();
  });

  els.partyCancel.addEventListener("click", resetPartyForm);

  els.partyZone.addEventListener("input", () => {
    renderZoneSuggestions(els.partyZone.value);
  });

  els.zoneSuggestions.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (!event.target.matches(".zone-chip")) return;
    const zone = event.target.dataset.zone;
    if (!zone) return;
    els.partyZone.value = zone;
    renderZoneSuggestions(zone);
    els.partyZone.focus();
  });

  els.modeMenu.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const mode = event.target.dataset.mode;
    if (!mode) return;
    applyPartyBandMode(state.activeModeMenuPartyId, mode);
    closePartyModeMenu();
  });

  els.partyList.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const row = event.target.closest(".party-item");
    if (!row) return;
    const id = Number(row.dataset.id);

    if (event.target.matches(".edit-btn")) {
      startEditingParty(id);
      return;
    }

    if (event.target.matches(".remove-btn")) {
      state.parties = state.parties.filter((party) => party.id !== id);
      if (state.editingPartyId === id) {
        resetPartyForm();
      }
      if (state.activeModeMenuPartyId === id) {
        closePartyModeMenu();
      }
      render();
    }

    if (event.target.matches(".custom-done-btn")) {
      const party = state.parties.find((entry) => entry.id === id);
      if (!party) return;
      party.customEditorOpen = false;
      render();
      return;
    }

    if (event.target.matches(".party-mode")) {
      const party = state.parties.find((entry) => entry.id === id);
      if (!party || party.bandMode !== "custom") return;
      party.customEditorOpen = !party.customEditorOpen;
      render();
      return;
    }
  });

  els.partyList.addEventListener("contextmenu", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const row = event.target.closest(".party-item");
    if (!row) return;
    event.preventDefault();
    showPartyModeMenu(Number(row.dataset.id), event.clientX, event.clientY);
  });

  els.partyList.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const row = event.target.closest(".party-item");
    if (!row) return;
    if (event.target.closest("button, input, label, .party-custom-editor")) return;
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

    clearLongPressTimer();
    state.longPressTimer = window.setTimeout(() => {
      showPartyModeMenu(Number(row.dataset.id), event.clientX, event.clientY);
    }, 520);
  });

  els.partyList.addEventListener("pointerup", clearLongPressTimer);
  els.partyList.addEventListener("pointercancel", clearLongPressTimer);
  els.partyList.addEventListener("pointerleave", clearLongPressTimer);

  els.bandEditor.addEventListener("pointerdown", onTimelineHandlePointerDown);
  els.partyList.addEventListener("pointerdown", onTimelineHandlePointerDown);
}

function populateTimezoneList() {
  let zones = commonZones;
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      zones = Intl.supportedValuesOf("timeZone");
    } catch {
      zones = commonZones;
    }
  }

  state.allZones = zones;
  state.zoneLookup = new Map(zones.map((zone) => [zone.toLowerCase(), zone]));
  state.normalizedZoneLookup = new Map(zones.map((zone) => [normalizeText(zone), zone]));

  zones.forEach((zone) => {
    const option = document.createElement("option");
    option.value = zone;
    els.zoneDatalist.appendChild(option);
  });
}

function upsertParty() {
  const name = els.partyName.value.trim();
  const zoneInput = els.partyZone.value.trim();

  if (!name || !zoneInput) return;
  const resolved = resolveTimeZoneInput(zoneInput);
  if (!resolved) {
    const top = getTimezoneSuggestions(zoneInput).slice(0, 3);
    const hint = top.length > 0 ? ` Try: ${top.map((s) => s.display).join(", ")}` : "";
    alert(`Time zone not recognized.${hint}`);
    return;
  }

  if (state.editingPartyId != null) {
    const party = state.parties.find((entry) => entry.id === state.editingPartyId);
    if (party) {
      party.name = name;
      party.timeZone = resolved.zone;
      party.zoneDisplay = resolved.display;
    }
  } else {
    state.parties.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      name,
      timeZone: resolved.zone,
      zoneDisplay: resolved.display,
      bandMode: "global",
      customBands: null,
      customEditorOpen: false
    });
  }

  resetPartyForm();
  render();
}

function startEditingParty(id) {
  const party = state.parties.find((entry) => entry.id === id);
  if (!party) return;
  state.editingPartyId = id;
  els.partyName.value = party.name;
  els.partyZone.value = party.timeZone;
  els.partySubmit.textContent = "Save party";
  els.partyCancel.classList.remove("hidden");
  renderZoneSuggestions(els.partyZone.value);
  render();
}

function resetPartyForm() {
  state.editingPartyId = null;
  els.partyForm.reset();
  els.partySubmit.textContent = "Add party";
  els.partyCancel.classList.add("hidden");
  renderZoneSuggestions("");
}

function resolveTimeZoneInput(input) {
  const direct = state.zoneLookup.get(input.toLowerCase());
  if (direct && isValidTimeZone(direct)) {
    return { zone: direct, display: direct };
  }

  const normalized = normalizeText(input);
  const normalizedZone = state.normalizedZoneLookup.get(normalized);
  if (normalizedZone && isValidTimeZone(normalizedZone)) {
    return { zone: normalizedZone, display: normalizedZone };
  }

  const alias = friendlyAliases.find((entry) =>
    entry.keys.some((key) => normalized.includes(normalizeText(key)) || normalizeText(key).includes(normalized))
  );
  if (alias && isValidTimeZone(alias.zone)) {
    return {
      zone: alias.zone,
      display: `${alias.label} (${alias.zone})`
    };
  }

  return null;
}

function getTimezoneSuggestions(query) {
  const needle = normalizeText(query);
  if (!needle) return [];

  const aliasMatches = friendlyAliases
    .filter((entry) => entry.keys.some((key) => normalizeText(key).includes(needle) || needle.includes(normalizeText(key))))
    .map((entry) => ({
      zone: entry.zone,
      display: `${entry.label} (${entry.zone})`,
      rank: 0
    }));

  const zoneMatches = state.allZones
    .filter((zone) => normalizeText(zone).includes(needle))
    .slice(0, 8)
    .map((zone, idx) => ({ zone, display: zone, rank: 1 + idx }));

  const merged = [];
  const seen = new Set();
  for (const item of [...aliasMatches, ...zoneMatches]) {
    if (seen.has(item.zone)) continue;
    seen.add(item.zone);
    merged.push(item);
  }

  return merged.sort((a, b) => a.rank - b.rank).slice(0, 6);
}

function renderZoneSuggestions(query) {
  const value = query.trim();
  els.zoneSuggestions.innerHTML = "";
  els.zoneHelp.textContent = "";

  if (!value) return;

  const resolved = resolveTimeZoneInput(value);
  if (resolved) {
    els.zoneHelp.textContent = `Will use ${resolved.display}`;
    return;
  }

  const suggestions = getTimezoneSuggestions(value);
  if (suggestions.length === 0) {
    els.zoneHelp.textContent = "No direct match. Try a city, country, or region name.";
    return;
  }

  els.zoneHelp.textContent = "Did you mean:";
  suggestions.forEach((suggestion) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zone-chip";
    button.dataset.zone = suggestion.zone;
    button.textContent = suggestion.display;
    els.zoneSuggestions.appendChild(button);
  });
}

function showPartyModeMenu(partyId, x, y) {
  const party = state.parties.find((entry) => entry.id === partyId);
  if (!party) return;

  state.activeModeMenuPartyId = partyId;
  els.modeMenu.classList.remove("hidden");

  const menuWidth = 220;
  const menuHeight = 92;
  const left = Math.min(x, window.innerWidth - menuWidth - 8);
  const top = Math.min(y, window.innerHeight - menuHeight - 8);

  els.modeMenu.style.left = `${Math.max(8, left)}px`;
  els.modeMenu.style.top = `${Math.max(8, top)}px`;
}

function closePartyModeMenu() {
  state.activeModeMenuPartyId = null;
  els.modeMenu.classList.add("hidden");
}

function clearLongPressTimer() {
  if (state.longPressTimer != null) {
    window.clearTimeout(state.longPressTimer);
    state.longPressTimer = null;
  }
}

function applyPartyBandMode(partyId, mode) {
  const party = state.parties.find((entry) => entry.id === partyId);
  if (!party) return;

  if (mode === "custom") {
    party.bandMode = "custom";
    if (!Array.isArray(party.customBands)) {
      party.customBands = structuredClone(state.bands);
    }
    party.customEditorOpen = true;
  } else {
    party.bandMode = "global";
    party.customEditorOpen = false;
  }

  render();
}

function isValidTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function renderBandEditor() {
  els.bandEditor.innerHTML = "";
  const hint = document.createElement("small");
  hint.className = "timeline-hint";
  hint.textContent = "Drag breakpoints. Crossing another breakpoint carries it along; overlapping handles stay selectable.";

  const timeline = createBandTimeline({
    bands: state.bands,
    scope: "global"
  });

  els.bandEditor.append(timeline, hint);
}

function render() {
  renderUtcLabel();
  renderBandEditor();
  renderParties();
  renderOverallMeter();
}

function renderUtcLabel() {
  const value = Number(els.slider.value);
  els.utcOutput.textContent = `${toClock(value)} UTC`;
}

function renderParties() {
  els.partyList.innerHTML = "";

  if (state.parties.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No parties yet. Add at least 2.";
    empty.style.color = "#52606b";
    els.partyList.appendChild(empty);
    return;
  }

  state.parties.forEach((party) => {
    const fragment = els.partyTemplate.content.cloneNode(true);
    const item = fragment.querySelector(".party-item");
    const content = fragment.querySelector(".party-content");
    const name = fragment.querySelector(".party-name");
    const zone = fragment.querySelector(".party-zone");
    const time = fragment.querySelector(".party-time");
    const bandNode = fragment.querySelector(".party-band");
    const modeNode = fragment.querySelector(".party-mode");
    const editButton = fragment.querySelector(".edit-btn");
    const customEditor = fragment.querySelector(".party-custom-editor");

    const localParts = localTimeForParty(party.timeZone);
    const minuteOfDay = localParts.hour * 60 + localParts.minute;
    const bands = getBandsForParty(party);
    const band = getBandForHourMinute(minuteOfDay, bands);

    item.dataset.id = String(party.id);
    content.dataset.id = String(party.id);
    if (party.id === state.editingPartyId) {
      item.classList.add("editing");
      editButton.textContent = "Editing";
      editButton.disabled = true;
    }
    name.textContent = party.name;
    zone.textContent = party.zoneDisplay || party.timeZone;
    time.textContent = `${localParts.dayLabel} ${toClock(minuteOfDay)} local`;
    bandNode.textContent = band.label;
    bandNode.style.background = band.color;
    if (party.bandMode === "custom") {
      modeNode.textContent = party.customEditorOpen ? "custom ranges (editing)" : "custom ranges (tap to edit)";
    } else {
      modeNode.textContent = "global ranges";
    }

    if (party.bandMode === "custom" && party.customEditorOpen) {
      item.classList.add("customized");
      renderCustomBandEditor(customEditor, party);
    }

    els.partyList.appendChild(fragment);
  });
}

function renderOverallMeter() {
  if (state.parties.length === 0) {
    els.overallMeter.style.background = "#8a8a8a";
    els.overallLabel.textContent = "Overall convenience: add parties";
    return;
  }

  const scores = state.parties.map((party) => {
    const local = localTimeForParty(party.timeZone);
    const minuteOfDay = local.hour * 60 + local.minute;
    const band = getBandForHourMinute(minuteOfDay, getBandsForParty(party));
    return band.weight;
  });

  const avg = scores.reduce((sum, x) => sum + x, 0) / scores.length;
  const normalized = avg / 3;

  const hue = 2 + normalized * 118;
  const color = `hsl(${hue}, 62%, 44%)`;

  els.overallMeter.style.background = color;
  els.overallLabel.textContent = `Overall convenience: ${avg.toFixed(2)} / 3.00`;
}

function localTimeForParty(timeZone) {
  const date = selectedUtcDateTime();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = Number(map.hour);
  const minute = Number(map.minute);

  const utcDate = {
    y: date.getUTCFullYear(),
    m: date.getUTCMonth() + 1,
    d: date.getUTCDate()
  };

  const localDate = {
    y: Number(map.year),
    m: Number(map.month),
    d: Number(map.day)
  };

  const dayDelta = serialDay(localDate) - serialDay(utcDate);
  const dayLabel = dayDelta === 0 ? "Today" : dayDelta > 0 ? `+${dayDelta}d` : `${dayDelta}d`;

  return { hour, minute, dayLabel };
}

function selectedUtcDateTime() {
  const [y, m, d] = els.meetingDate.value.split("-").map(Number);
  const minutes = Number(els.slider.value);
  return new Date(Date.UTC(y, m - 1, d, 0, minutes));
}

function getBandsForParty(party) {
  if (party.bandMode === "custom" && Array.isArray(party.customBands)) {
    return party.customBands;
  }

  return state.bands;
}

function renderCustomBandEditor(container, party) {
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "custom-editor-title";
  const label = document.createElement("span");
  label.textContent = "Customized ranges";
  const doneButton = document.createElement("button");
  doneButton.type = "button";
  doneButton.className = "custom-done-btn";
  doneButton.textContent = "Done";
  header.append(label, doneButton);

  const timeline = createBandTimeline({
    bands: getBandsForParty(party),
    scope: "party",
    partyId: party.id
  });

  const hint = document.createElement("small");
  hint.className = "timeline-hint";
  hint.textContent = "Tap or click the mode badge to reopen this editor.";

  container.append(header, timeline, hint);
}

function createBandTimeline({ bands, scope, partyId = null }) {
  const wrapper = document.createElement("div");
  wrapper.className = "band-timeline-wrap";

  const legend = document.createElement("div");
  legend.className = "band-legend";
  const segments = getBandSegments(bands);
  segments.forEach((segment) => {
    const badge = document.createElement("span");
    badge.className = "legend-badge";
    badge.innerHTML = `<span class="band-swatch" style="background:${segment.color}"></span>${segment.label}: ${toClock(
      Math.round(segment.start * 60)
    )} - ${toClock(Math.round(segment.end * 60))}`;
    legend.appendChild(badge);
  });

  const track = document.createElement("div");
  track.className = "band-timeline";
  track.dataset.scope = scope;
  if (partyId != null) {
    track.dataset.partyId = String(partyId);
  }

  const ticks = document.createElement("div");
  ticks.className = "timeline-ticks";
  [0, 6, 12, 18, 24].forEach((hour) => {
    const tick = document.createElement("span");
    tick.className = "timeline-tick";
    tick.style.left = `${(hour / 24) * 100}%`;
    tick.textContent = hour === 24 ? "24/0" : String(hour);
    ticks.appendChild(tick);
  });

  segments.forEach((segment) => {
    appendSegmentFill(track, segment.start, segment.end, segment.color);
  });

  const positionGroups = groupBandPositions(bands);
  bands.forEach((band, idx) => {
    const group = positionGroups.get(normalizeBandBreakpoint(band.start));
    const groupIndex = group.findIndex((x) => x === idx);
    const offset = (groupIndex - (group.length - 1) / 2) * 10;
    const leftPct = (normalizeBandBreakpoint(band.start) / 24) * 100;
    track.appendChild(createBandHandle({ scope, partyId, idx, band, leftPct, offset }));

    if (normalizeBandBreakpoint(band.start) === 0) {
      track.appendChild(createBandHandle({ scope, partyId, idx, band, leftPct: 100, offset, mirror: true }));
    }
  });

  wrapper.append(legend, track, ticks);
  return wrapper;
}

function createBandHandle({ scope, partyId, idx, band, leftPct, offset, mirror = false }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = mirror ? "band-handle band-handle-mirror" : "band-handle";
  button.dataset.scope = scope;
  if (partyId != null) {
    button.dataset.partyId = String(partyId);
  }
  button.dataset.bandIndex = String(idx);
  button.title = `${band.label} starts at ${String(normalizeBandBreakpoint(band.start)).padStart(2, "0")}:00`;
  button.style.background = band.color;
  button.style.left = `${leftPct}%`;
  button.style.transform = `translate(calc(-50% + ${offset}px), -50%)`;
  return button;
}

function appendSegmentFill(track, start, end, color) {
  if (start === end) return;

  if (start < end) {
    const part = document.createElement("span");
    part.className = "timeline-segment";
    part.style.left = `${(start / 24) * 100}%`;
    part.style.width = `${((end - start) / 24) * 100}%`;
    part.style.background = color;
    track.appendChild(part);
    return;
  }

  appendSegmentFill(track, start, 24, color);
  appendSegmentFill(track, 0, end, color);
}

function groupBandPositions(bands) {
  const groups = new Map();
  bands.forEach((band, idx) => {
    const key = normalizeBandBreakpoint(band.start);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(idx);
  });
  return groups;
}

function getBandForHourMinute(minuteOfDay, bands = state.bands) {
  const hour = minuteOfDay / 60;
  const segments = getBandSegments(bands);
  for (const segment of segments) {
    if (inRange(hour, segment.start, segment.end)) return segment;
  }
  return { label: "Unassigned", color: "#777777", weight: 1 };
}

function onTimelineHandlePointerDown(event) {
  if (!(event.target instanceof HTMLElement)) return;
  if (!event.target.matches(".band-handle")) return;
  event.preventDefault();

  const bandIndex = Number(event.target.dataset.bandIndex);
  const scope = event.target.dataset.scope;
  const partyId = Number(event.target.dataset.partyId);
  if (Number.isNaN(bandIndex) || !scope) return;

  state.drag = {
    scope,
    partyId: Number.isNaN(partyId) ? null : partyId,
    bandIndex,
    pointerId: event.pointerId,
    lastX: event.clientX,
    fractionalSteps: 0
  };

  if (event.target instanceof Element && typeof event.target.setPointerCapture === "function") {
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch {
      // Ignore if pointer capture cannot be set.
    }
  }
}

function handleTimelinePointerMove(event) {
  if (!state.drag) return;
  if (event.pointerId !== state.drag.pointerId) return;

  const drag = state.drag;
  const timeline = resolveActiveTimelineElement(drag);
  if (!timeline) return;

  const bands = getBandsByScope(drag.scope, drag.partyId);
  if (!bands) return;

  const rect = timeline.getBoundingClientRect();
  if (rect.width <= 0) return;

  const deltaHours = ((event.clientX - drag.lastX) / rect.width) * 24;
  drag.lastX = event.clientX;
  drag.fractionalSteps += deltaHours;

  let moved = false;
  while (drag.fractionalSteps >= 0.5) {
    stepDraggedHandles(bands, drag.bandIndex, 1, drag);
    drag.fractionalSteps -= 1;
    moved = true;
  }

  while (drag.fractionalSteps <= -0.5) {
    stepDraggedHandles(bands, drag.bandIndex, -1, drag);
    drag.fractionalSteps += 1;
    moved = true;
  }

  if (moved) render();
}

function stopTimelineDrag(event) {
  if (!state.drag) return;
  if (event.pointerId !== state.drag.pointerId) return;
  state.drag = null;
}

function resolveActiveTimelineElement(drag) {
  if (drag.scope === "global") {
    return els.bandEditor.querySelector(".band-timeline");
  }

  return els.partyList.querySelector(`.band-timeline[data-scope="party"][data-party-id="${drag.partyId}"]`);
}

function getBandsByScope(scope, partyId) {
  if (scope === "global") return state.bands;
  const party = state.parties.find((entry) => entry.id === partyId);
  if (!party || !Array.isArray(party.customBands)) return null;
  return party.customBands;
}

function stepDraggedHandles(bands, activeIndex, stepDir, drag) {
  const unwrapped = unwrapBandStarts(bands);
  const moved = unwrapped[activeIndex] + stepDir;
  const minBound = activeIndex === 0 ? unwrapped[unwrapped.length - 1] - 24 : unwrapped[activeIndex - 1];
  const maxBound = activeIndex === unwrapped.length - 1 ? unwrapped[0] + 24 : unwrapped[activeIndex + 1];
  unwrapped[activeIndex] = clamp(moved, minBound, maxBound);
  applyUnwrappedStarts(bands, unwrapped);
}

function unwrapBandStarts(bands) {
  const values = [];
  values[0] = normalizeBandBreakpoint(bands[0].start);

  for (let i = 1; i < bands.length; i += 1) {
    let value = normalizeBandBreakpoint(bands[i].start);
    while (value < values[i - 1]) {
      value += 24;
    }
    values[i] = value;
  }

  return values;
}

function applyUnwrappedStarts(bands, unwrapped) {
  for (let i = 0; i < bands.length; i += 1) {
    bands[i].start = mod24(unwrapped[i]);
  }
}

function getBandSegments(bands) {
  const ordered = [...bands].sort((a, b) => a.start - b.start);
  return ordered.map((band, idx) => {
    const next = ordered[(idx + 1) % ordered.length];
    return {
      ...band,
      end: next.start
    };
  });
}

function buildSegmentMap(bands) {
  const map = new Map();
  getBandSegments(bands).forEach((segment) => {
    map.set(segment.id, segment);
  });
  return map;
}

function normalizeBandBreakpoint(value) {
  const rounded = Math.round(clamp(value, 0, 24));
  return rounded === 24 ? 0 : rounded;
}

function mod24(value) {
  return ((value % 24) + 24) % 24;
}

function inRange(hour, start, end) {
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

function toClock(minuteOfDay) {
  const minute = ((minuteOfDay % 60) + 60) % 60;
  const hour = Math.floor(minuteOfDay / 60) % 24;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function serialDay(dateParts) {
  return Math.floor(Date.UTC(dateParts.y, dateParts.m - 1, dateParts.d) / 86400000);
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}
