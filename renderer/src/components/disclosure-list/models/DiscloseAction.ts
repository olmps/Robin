export enum DiscloseAction {
  select, clear, fold, search
}

export type DiscloseActionHandler = (action: DiscloseAction, content: any | undefined) => void