/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

export class BadRequestError extends Error {
  code: number

  custom: boolean

  parent: any

  constructor(parentError: any) {
    super('Request is not valid')
    this.parent = parentError
    this.name = 'BadRequestError'
    this.code = 400
    this.custom = true
  }
}
export class UnAuthenticatedError extends Error {
  code: number

  custom: boolean

  constructor() {
    super(`Request is not authenticated`)
    this.name = 'UnAuthenticatedError'
    this.code = 401
    this.custom = true
  }
}
export class EntityNotFoundError extends Error {
  code: number

  custom: boolean

  parent: any

  constructor(type: any | null, message: string | null) {
    super(message ? message : `Object of type ${type} has not been found`)
    this.parent = message
    this.name = 'EntityNotFoundError'
    this.code = 404
    this.custom = true
  }
}

export class DatabaseError extends Error {
  code: number

  custom: boolean

  parent: any

  constructor(parentError: any) {
    super(`Internal data storage error`)
    this.parent = parentError
    this.code = 500
    this.name = 'DatabaseError'
    this.custom = true
  }
}

export class InternalServerError extends Error {
  code: number

  custom: boolean

  parent: any

  constructor(parentError: any) {
    super(`Internal server error`)
    this.parent = parentError
    this.code = 500
    this.name = 'InternalServerError'
    this.custom = true
  }
}

export class ObjectAlreadyExistsError extends Error {
  code: number

  custom: boolean

  constructor(id: string | null, customMessage: string) {
    super(customMessage ? customMessage : `Object ${id} already exists`)
    this.code = 409
    this.name = 'ObjectAlreadyExistsError'
    this.custom = true
  }
}

export class IllegalStateError extends Error {
  code: number

  custom: boolean

  constructor(message: string) {
    super(message)
    this.code = 406
    this.name = 'IllegalStateError'
    this.custom = true
  }
}

export class InvalidArgumentError extends Error {
  code: number

  custom: boolean

  constructor(message: string) {
    super(message)
    this.code = 422
    this.name = 'InvalidArgumentError'
    this.custom = true
  }
}

export class PermissionAccessViolationError extends Error {
  code: number

  custom: boolean

  constructor() {
    super(`User does not have access to the requested resource`)
    this.code = 403
    this.name = 'PermissionAccessViolationError'
    this.custom = true
  }
}
