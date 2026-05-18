import { CustomPolymer } from "./types";

// Decorate later
class CustomPolymerMap extends Map<string, CustomPolymer> {
  /*
   * A Non case sensitive string, CustomPolymer map
   * Original cases are preserved
   **/
  constructor() {
    super();
  }
  has(/* @customKey */ key: string) {
    key = key.toUpperCase();
    for (let k of this.keys()) if (key === k.toUpperCase()) return true;
    return false;
  }
  get(/* @customKey */ key: string): CustomPolymer | undefined {
    key = key.toUpperCase();
    for (const [k, v] of this.entries()) {
      if (key === k.toUpperCase()) {
        return v;
      }
    }
    return undefined;
  }
}

export default CustomPolymerMap;
