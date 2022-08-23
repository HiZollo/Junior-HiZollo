import { APIBaseComponent, ComponentType } from "../types/types";

export abstract class ComponentBuilder<T extends ComponentType> {
  public type: T;
  
  constructor(data: APIBaseComponent<T>) {
    this.type = data.type;
  }
}