export enum DiscloseAction {
  fingerprint, intercept, interceptPath, select, clear, fold, search
}

export type DiscloseActionHandler = (action: DiscloseAction, content: any | undefined) => void