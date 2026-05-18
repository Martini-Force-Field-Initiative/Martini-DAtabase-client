import { Molecule } from "./types/entities";

const REGEXP_MARTINI_VERSION = /martini([\d\.]+)/;

const versionsCompare = (ff1: string, ff2: string) => {
  console.log("==>", ff1, ff2);
  if (ff1.startsWith("martini3") && ff2.startsWith("martini2")) return ff1;
  if (ff2.startsWith("martini3") && ff1.startsWith("martini2")) return ff2;

  for (let _ of [ff1, ff2]) {
    if (_.endsWith("lipidome")) return _;
  }

  return ff1;
};

export const forceFieldSearchPriorityRule = (
  ff: string | string[],
  ...libs: (string | string[])[]
) => {
  /**
   * Returns a single forceField database search from a collection
   */

  let _ = Array.isArray(ff) ? ff : [ff];
  libs.forEach((x) => {
    if (Array.isArray(x)) _ = [..._, ...x];
    else _.push(x);
  });
  /*
  console.log("forceFieldSearchPriorityRule:reducing this");
  console.log(_);
  */
  const prio = _.filter((v) => v !== undefined).reduce(
    (prev, curr) => versionsCompare(prev, curr),
    _[0],
  );
  /*
  console.log("==>");
  console.log(prio);
  */
  return prio;
};

export const forceFieldVersionMatcher = (
  x: string,
  y: string,
  type: "major" | "strict",
): boolean => {
  /**
  martini3 === martini3001
  Really basic for now, free to expand it...
*/

  /*-----*/

  console.log(x, y, type);
  if (x === y) return true;

  const m1 = x.match(REGEXP_MARTINI_VERSION);
  const m2 = y.match(REGEXP_MARTINI_VERSION);
  if (m1 === null || m2 === null) return x === y;

  const no_nlt = [x, y].reduce((a, b) => a && !b.endsWith("lipidome"), true);
  if (type === "major") return m1[1][0] === m2[1][0] && no_nlt;

  return x === y;
};

export const polymerEditorMoleculeSearchFilter = (
  ff: string,
  mol: Molecule,
) => {
  let actualFF_constraint = ff;
  if (!mol.category.includes("Lipids"))
    actualFF_constraint = actualFF_constraint.replace(" lipidome", "");
  return forceFieldVersionMatcher(
    actualFF_constraint,
    mol.force_field,
    "major",
  );
};
