/**
 * Luxon `DateTime#toFormat` tokens — longest-first greedy match (subset supported for YAML).
 * See https://moment.github.io/luxon/#/formatting?id=table-of-tokens
 */
const LUXON_FORMAT_TOKENS: string[] = [
  "yyyyy",
  "yyyy",
  "yyy",
  "yy",
  "y",
  "LLLL",
  "LLL",
  "LL",
  "L",
  "MMMM",
  "MMM",
  "MM",
  "M",
  "DDDD",
  "DDD",
  "DD",
  "D",
  "dd",
  "d",
  "EEEE",
  "EEE",
  "EE",
  "E",
  "eeee",
  "eee",
  "ee",
  "e",
  "cccc",
  "ccc",
  "cc",
  "c",
  "WW",
  "W",
  "QQQQ",
  "QQQ",
  "QQ",
  "Q",
  "qqqq",
  "qqq",
  "qq",
  "q",
  "GGGGG",
  "GGGG",
  "GGG",
  "GG",
  "G",
  "SSS",
  "SS",
  "S",
  "ZZZZ",
  "ZZZ",
  "ZZ",
  "Z",
  "XXXX",
  "XXX",
  "XX",
  "X",
  "xxxx",
  "xxx",
  "xx",
  "x",
  "HH",
  "H",
  "hh",
  "h",
  "mm",
  "m",
  "ss",
  "s",
  "a",
  "ff",
  "f",
  "FF",
  "F",
  "tt",
  "t",
  "TT",
  "T",
  "ooo",
  "oo",
  "o",
  "nn",
  "n"
];

LUXON_FORMAT_TOKENS.sort((a, b) => b.length - a.length);

/**
 * Fail-fast validation for card `x_axis_format` (Luxon-compatible subset).
 * Throws if the pattern contains unknown token runs or disallowed characters.
 */
export function validateXAxisFormat(input: string): void {
  const s = String(input).trim();
  if (s === "") {
    throw new Error("x_axis_format cannot be empty");
  }

  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === undefined) break; // dead path: i < s.length (911/TD-6)

    if (c === "'") {
      i++;
      while (i < s.length) {
        if (s[i] === "'") {
          if (s[i + 1] === "'") {
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    if (/[a-zA-Z]/.test(c)) {
      let matched = false;
      for (const tok of LUXON_FORMAT_TOKENS) {
        if (s.startsWith(tok, i)) {
          i += tok.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        throw new Error(
          `Unsupported Luxon token starting at position ${i} in x_axis_format`
        );
      }
      continue;
    }

    if (/[\s+\-:.,_/0-9T]/.test(c)) {
      i++;
      continue;
    }

    throw new Error(`Invalid character in x_axis_format at position ${i}`);
  }
}
