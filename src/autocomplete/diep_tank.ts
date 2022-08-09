import { HZClient } from "../classes/HZClient";
import tanks from "../features/json/diepTanks.json";
import { AutocompleteData } from "../utils/types";

export default function(_client: HZClient): AutocompleteData {
  const result = [];
  for (const tank in tanks)
    result.push({ name: tank });

  return { '坦克': result };
}
