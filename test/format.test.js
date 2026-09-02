const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const {
  render,
  renderRecord,
  renderTable,
  jsonSafe,
  cell,
  short,
  timestamp,
} = require("../src/format");

describe("jsonSafe", () => {
  test("converts a BigInt to a string", () => {
    assert.equal(jsonSafe(42n), "42");
  });

  test("converts BigInt inside an object", () => {
    assert.deepEqual(jsonSafe({ count: 42n }), { count: "42" });
  });

  test("converts BigInt inside an array", () => {
    assert.deepEqual(jsonSafe([1n, 2n]), ["1", "2"]);
  });

  test("converts BigInt nested several levels deep", () => {
    assert.deepEqual(jsonSafe({ a: { b: [{ c: 7n }] } }), { a: { b: [{ c: "7" }] } });
  });

  test("leaves other values alone", () => {
    assert.deepEqual(jsonSafe({ a: "x", b: 1, c: true, d: null }), {
      a: "x",
      b: 1,
      c: true,
      d: null,
    });
  });

  test("produces output that JSON.stringify accepts", () => {
    assert.doesNotThrow(() => JSON.stringify(jsonSafe({ n: 1n })));
  });
});

describe("cell", () => {
  test("renders null and undefined as a dash", () => {
    assert.equal(cell(null), "-");
    assert.equal(cell(undefined), "-");
  });

  test("renders booleans as yes and no", () => {
    assert.equal(cell(true), "yes");
    assert.equal(cell(false), "no");
  });

  test("renders zero rather than treating it as empty", () => {
    assert.equal(cell(0), "0");
    assert.equal(cell(0n), "0");
  });

  test("renders an empty string as itself", () => {
    assert.equal(cell(""), "");
  });
});

describe("renderRecord", () => {
  test("aligns the values", () => {
    const out = renderRecord({ a: 1, longer: 2 });
    const [first, second] = out.split("\n");
    assert.equal(first.indexOf("1"), second.indexOf("2"));
  });

  test("reports an empty record", () => {
    assert.equal(renderRecord({}), "(empty)");
  });
});

describe("renderTable", () => {
  const rows = [
    { name: "Counter", gas: 23734n },
    { name: "Poll", gas: 46555n },
  ];

  test("reports an empty table", () => {
    assert.equal(renderTable([]), "(no rows)");
    assert.equal(renderTable(null), "(no rows)");
  });

  test("includes a header and a separator", () => {
    const lines = renderTable(rows).split("\n");
    assert.match(lines[0], /name/);
    assert.match(lines[1], /^-+ +-+$/);
    assert.equal(lines.length, 4);
  });

  test("aligns every column to the same width", () => {
    const lines = renderTable(rows).split("\n");
    const positions = lines.map((l) => l.indexOf("2"));
    assert.equal(lines[2].indexOf("23734"), lines[3].indexOf("46555"));
    assert.ok(positions.length === 4);
  });

  test("honours an explicit column order", () => {
    assert.match(renderTable(rows, ["gas", "name"]).split("\n")[0], /^gas/);
  });

  test("does not leave trailing whitespace", () => {
    for (const line of renderTable(rows).split("\n")) {
      assert.equal(line, line.trimEnd());
    }
  });
});

describe("render", () => {
  test("emits JSON when asked", () => {
    assert.deepEqual(JSON.parse(render({ count: 1n }, { json: true })), { count: "1" });
  });

  test("renders an array as a table by default", () => {
    assert.match(render([{ a: 1 }], {}), /^a\n/);
  });

  test("renders an object as a record by default", () => {
    assert.equal(render({ a: 1 }, {}), "a  1");
  });

  test("renders a scalar on its own", () => {
    assert.equal(render(5n, {}), "5");
  });
});

describe("short", () => {
  test("shortens a long address", () => {
    assert.equal(short("0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955"), "0x933ecA...7Bc955");
  });

  test("leaves a short value untouched", () => {
    assert.equal(short("0x1234"), "0x1234");
  });
});

describe("timestamp", () => {
  test("formats a Unix time", () => {
    assert.equal(timestamp(1700000000), "2023-11-14T22:13:20Z");
  });

  test("accepts a BigInt", () => {
    assert.equal(timestamp(1700000000n), "2023-11-14T22:13:20Z");
  });

  test("renders an unset timestamp as a dash", () => {
    assert.equal(timestamp(0), "-");
    assert.equal(timestamp(0n), "-");
  });
});
