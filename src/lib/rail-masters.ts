// Registry of Rail Clean masters shown in the Settings hub. Each master is a
// plain database table; this list only describes how to show and edit it.

export type FieldType = "text" | "number" | "date" | "bool" | "time" | "select" | "ref";
export type MasterField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  ref?: { table: string; label: string };
  hideInTable?: boolean;
};
export type MasterDef = {
  table: string;
  label: string;
  description: string;
  group: "Places & trains" | "Cleaning" | "Contracts" | "System";
  orderBy: string;
  versioned?: boolean;
  fields: MasterField[];
};

const dated: MasterField[] = [
  { key: "effective_from", label: "Valid from", type: "date", required: true },
  { key: "effective_to", label: "Valid to", type: "date" },
];

export const RAIL_MASTERS: MasterDef[] = [
  {
    table: "rail_locations", label: "Places", group: "Places & trains", orderBy: "code",
    description: "Zones, divisions, depots, stations, pit lines, platforms and stores.",
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "type", label: "Type", type: "select", required: true, options: ["zone", "division", "depot", "station", "pit_line", "platform", "bay", "store"] },
      { key: "parent_id", label: "Belongs to", type: "ref", ref: { table: "rail_locations", label: "name" } },
      { key: "area_class", label: "Area class", type: "select", options: ["A", "B", "C"] },
      { key: "latitude", label: "Latitude", type: "number", hideInTable: true },
      { key: "longitude", label: "Longitude", type: "number", hideInTable: true },
    ],
  },
  {
    table: "rail_trains", label: "Trains", group: "Places & trains", orderBy: "number",
    description: "Train number, name, category and the depot that maintains it.",
    fields: [
      { key: "number", label: "Train no.", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "category_id", label: "Category", type: "ref", ref: { table: "rail_train_categories", label: "name" } },
      { key: "base_depot_id", label: "Base depot", type: "ref", ref: { table: "rail_locations", label: "name" } },
    ],
  },
  {
    table: "rail_coaches", label: "Coaches", group: "Places & trains", orderBy: "coach_number",
    description: "Every coach with its number, type, owning depot and QR code.",
    fields: [
      { key: "coach_number", label: "Coach no.", type: "text", required: true },
      { key: "coach_type_id", label: "Type", type: "ref", ref: { table: "rail_coach_types", label: "code" } },
      { key: "owning_depot_id", label: "Depot", type: "ref", ref: { table: "rail_locations", label: "name" } },
      { key: "qr_code", label: "QR code", type: "text" },
      { key: "last_intensive_on", label: "Last deep clean", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["active", "sick", "condemned"] },
    ],
  },
  {
    table: "rail_coach_types", label: "Coach types", group: "Places & trains", orderBy: "code", versioned: true,
    description: "SL, GS, 3A, 2A and others, with berths, toilets and area.",
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "family_id", label: "Family", type: "ref", ref: { table: "rail_coach_families", label: "name" } },
      { key: "berths", label: "Berths", type: "number" },
      { key: "seats", label: "Seats", type: "number" },
      { key: "toilet_count", label: "Toilets", type: "number" },
      { key: "toilet_type", label: "Toilet type", type: "select", options: ["bio", "vacuum", "conventional", "none"] },
      { key: "area_m2", label: "Area (m²)", type: "number", hideInTable: true },
      { key: "billable", label: "Billable", type: "bool" },
      ...dated,
    ],
  },
  {
    table: "rail_coach_families", label: "Coach families", group: "Places & trains", orderBy: "sort_order",
    description: "ICF, LHB, Train-set, EMU and others.",
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "sort_order", label: "Order", type: "number" },
    ],
  },
  {
    table: "rail_train_categories", label: "Train categories", group: "Places & trains", orderBy: "name", versioned: true,
    description: "Rajdhani, Shatabdi, Vande Bharat and others, with a quality weight.",
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "quality_weight", label: "Quality weight", type: "number" },
      ...dated,
    ],
  },
  {
    table: "rail_service_types", label: "Service types", group: "Cleaning", orderBy: "name",
    description: "Pit-line clean, platform return, Clean Train Station, OBHS and more.",
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "default_window_minutes", label: "Window (min)", type: "number" },
      { key: "mode", label: "Mode", type: "select", options: ["full", "cts_quick", "obhs_trip", "premises", "water", "custom"] },
    ],
  },
  {
    table: "rail_checklist_items", label: "Checklist items", group: "Cleaning", orderBy: "sort_order",
    description: "What the cleaner ticks, in English, Hindi and Marathi.",
    fields: [
      { key: "template_id", label: "Checklist", type: "ref", required: true, ref: { table: "rail_checklist_templates", label: "name" } },
      { key: "area", label: "Area", type: "text", required: true },
      { key: "label_en", label: "English", type: "text", required: true },
      { key: "label_hi", label: "Hindi", type: "text", hideInTable: true },
      { key: "label_mr", label: "Marathi", type: "text", hideInTable: true },
      { key: "photo_required", label: "Photo", type: "bool" },
      { key: "ai_check", label: "AI check", type: "bool" },
      { key: "weight", label: "Weight", type: "number" },
      { key: "sort_order", label: "Order", type: "number" },
    ],
  },
  {
    table: "rail_task_templates", label: "Task templates", group: "Cleaning", orderBy: "task_name",
    description: "Tasks created for each coach, with skill and standard minutes.",
    fields: [
      { key: "service_type_id", label: "Service", type: "ref", ref: { table: "rail_service_types", label: "name" } },
      { key: "coach_type_id", label: "Coach type", type: "ref", ref: { table: "rail_coach_types", label: "code" } },
      { key: "task_name", label: "Task", type: "text", required: true },
      { key: "skill", label: "Skill", type: "text" },
      { key: "standard_minutes", label: "Minutes", type: "number" },
    ],
  },
  {
    table: "rail_contracts", label: "Contracts", group: "Contracts", orderBy: "loa_number",
    description: "Letter of Acceptance, GeM reference, value, GST and partial-clean rule.",
    fields: [
      { key: "loa_number", label: "LoA no.", type: "text", required: true },
      { key: "gem_ref", label: "GeM ref", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "client_location_id", label: "Client (division)", type: "ref", ref: { table: "rail_locations", label: "name" } },
      { key: "start_date", label: "Start", type: "date" },
      { key: "end_date", label: "End", type: "date" },
      { key: "value", label: "Value (₹)", type: "number" },
      { key: "gst_percent", label: "GST %", type: "number" },
      { key: "partial_clean_rule", label: "Partly cleaned", type: "select", options: ["pro_rata", "zero", "full"] },
    ],
  },
  {
    table: "rail_rate_lines", label: "Rate lines", group: "Contracts", orderBy: "effective_from", versioned: true,
    description: "Rate per coach, day, trip or lump sum, with dates.",
    fields: [
      { key: "contract_id", label: "Contract", type: "ref", required: true, ref: { table: "rail_contracts", label: "loa_number" } },
      { key: "service_type_id", label: "Service", type: "ref", ref: { table: "rail_service_types", label: "name" } },
      { key: "coach_type_id", label: "Coach type", type: "ref", ref: { table: "rail_coach_types", label: "code" } },
      { key: "category_id", label: "Category", type: "ref", ref: { table: "rail_train_categories", label: "name" } },
      { key: "billing_unit", label: "Unit", type: "select", options: ["per_coach", "per_day", "per_trip", "lump_sum"] },
      { key: "rate", label: "Rate (₹)", type: "number", required: true },
      ...dated,
    ],
  },
  {
    table: "rail_shifts", label: "Shifts", group: "Contracts", orderBy: "start_time",
    description: "Shift names and times.",
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "start_time", label: "Start", type: "time", required: true },
      { key: "end_time", label: "End", type: "time", required: true },
    ],
  },
  {
    table: "rail_reason_codes", label: "Reason codes", group: "System", orderBy: "code",
    description: "Reasons for not placed, cancelled, partly done and similar.",
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "label", label: "Label", type: "text", required: true },
      { key: "applies_to", label: "Applies to", type: "text" },
    ],
  },
  {
    table: "rail_alert_rules", label: "Alert rules", group: "System", orderBy: "code",
    description: "When to alert supervisors and managers.",
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "threshold_minutes", label: "Minutes", type: "number" },
      { key: "enabled", label: "On", type: "bool" },
    ],
  },
  {
    table: "rail_labels", label: "Screen labels", group: "System", orderBy: "key",
    description: "Rename what users see, per language.",
    fields: [
      { key: "key", label: "Key", type: "text", required: true },
      { key: "language", label: "Language", type: "select", options: ["en", "hi", "mr"] },
      { key: "text", label: "Text", type: "text", required: true },
    ],
  },
  {
    table: "rail_feature_flags", label: "Feature switches", group: "System", orderBy: "key",
    description: "Turn features on or off, such as security-company screens.",
    fields: [
      { key: "key", label: "Key", type: "text", required: true },
      { key: "description", label: "Description", type: "text" },
      { key: "enabled", label: "On", type: "bool" },
    ],
  },
  {
    table: "rail_ai_settings", label: "AI clean check", group: "System", orderBy: "effective_from", versioned: true,
    description: "Pass mark and needs-attention mark for the AI photo check.",
    fields: [
      { key: "pass_score", label: "Pass mark (of 10)", type: "number", required: true },
      { key: "attention_score", label: "Attention mark", type: "number", required: true },
      ...dated,
    ],
  },
];
