/**
 * Output rendering.
 *
 * Every command returns plain data and hands it here, so --json and the human
 * readable form are guaranteed to carry the same values rather than being
 * produced by two separate code paths.
 */

/** Recursively converts BigInt to string so the result survives JSON.stringify. */
function jsonSafe(value) {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, jsonSafe(v)]));
  }
  return value;
}

/** Renders a value for a terminal, where undefined and null should be visible. */
function cell(value) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(jsonSafe(value));
  return String(value);
}

/**
 * Renders key/value pairs as an aligned block.
 *
 * @param {object} record
 * @returns {string}
 */
function renderRecord(record) {
  const entries = Object.entries(record);
  if (entries.length === 0) return "(empty)";
  const width = Math.max(...entries.map(([k]) => k.length));
  return entries.map(([k, v]) => `${k.padEnd(width)}  ${cell(v)}`).join("\n");
}

/**
 * Renders an array of uniform objects as an aligned table.
 *
 * @param {object[]} rows
 * @param {string[]} [columns] Column order; inferred from the first row if omitted.
 * @returns {string}
 */
function renderTable(rows, columns) {
  if (!rows || rows.length === 0) return "(no rows)";

  const cols = columns || Object.keys(rows[0]);
  const body = rows.map((row) => cols.map((c) => cell(row[c])));
  const widths = cols.map((c, i) => Math.max(c.length, ...body.map((r) => r[i].length)));

  const line = (cells) =>
    cells
      .map((value, i) => value.padEnd(widths[i]))
      .join("  ")
      .trimEnd();

  return [line(cols), line(widths.map((w) => "-".repeat(w))), ...body.map(line)].join("\n");
}

/**
 * Picks the rendering for a command result.
 *
 * @param {*} result Whatever the command returned.
 * @param {object} flags Parsed flags; --json is read.
 * @returns {string}
 */
function render(result, flags = {}) {
  if (flags.json) return JSON.stringify(jsonSafe(result), null, 2);
  if (Array.isArray(result)) return renderTable(result);
  if (result && typeof result === "object") return renderRecord(result);
  return cell(result);
}

/** Shortens a hash or address for table output. */
function short(value, keep = 6) {
  const text = String(value);
  if (text.length <= keep * 2 + 2) return text;
  return `${text.slice(0, keep + 2)}...${text.slice(-keep)}`;
}

/** Formats a Unix timestamp as an ISO string, or "-" when unset. */
function timestamp(seconds) {
  const value = typeof seconds === "bigint" ? Number(seconds) : seconds;
  if (!value) return "-";
  return new Date(value * 1000).toISOString().replace(".000Z", "Z");
}

module.exports = { render, renderRecord, renderTable, jsonSafe, cell, short, timestamp };
