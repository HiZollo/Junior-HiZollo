import { HZClient } from "../classes/HZClient";
import tanks from "../features/json/diepTanks.json";
import { AutocompleteReturnType } from "../utils/types";

export default function(_client: HZClient): AutocompleteReturnType {
  const result = [];
  for (const tank in tanks)
    result.push({ name: tank });

  return { '坦克': result };
}
