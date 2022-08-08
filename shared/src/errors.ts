export class InvalidTargetError extends Error {
  constructor(m?: string) {
    super(m ?? 'Invalid target!');
  }
}

export class InvalidEffectParamsError extends Error {
  constructor(m?: string) {
    super(m ?? 'Invalid effect parameters!');
  }
}

export class MissingTargetError extends Error {
  constructor(m?: string) {
    super(m ?? 'Missing target!');
  }
}
