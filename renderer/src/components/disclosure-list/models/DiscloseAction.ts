export enum DiscloseAction {
  fingerprint, intercept, select, clear, fold, search
}

export type DiscloseActionHandler = (action: DiscloseAction, content: any | undefined) => void