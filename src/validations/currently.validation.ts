import { body, query } from 'express-validator'
import { CurrentlyTag, CurrentlyUpdateTypes } from '../types/currently.types'

export const validateUpdates = (updates: any[]) => {
  for (const update of updates) {
    switch (update.updateType) {
      case CurrentlyUpdateTypes.EDIT_PLACE_TEXT:
        if (typeof update.newValue !== 'string') {
          throw new Error('newValue must be a string for EDIT_PLACE_TEXT')
        }
        break

      case CurrentlyUpdateTypes.EDIT_PLACE_DURATION:
        if (typeof update.newValue !== 'number') {
          throw new Error('newValue must be a number for EDIT_PLACE_DURATION')
        }
        break

      case CurrentlyUpdateTypes.NEW_PLACE:
        if (!update.newValue || typeof update.newValue.text !== 'string' || typeof update.newValue.duration !== 'number') {
          throw new Error('newValue must contain text and duration for NEW_PLACE')
        }
        break

      case CurrentlyUpdateTypes.DELETE_PLACE:
        // No additional validation needed
        break

      case CurrentlyUpdateTypes.NEW_TAG:
        if (!update.newValue || typeof update.newValue.tag !== 'string' || typeof update.newValue.duration !== 'number') {
          throw new Error('newValue must contain tag and duration for NEW_TAG')
        }
        break

      case CurrentlyUpdateTypes.EDIT_TAG_TEXT:
        if (typeof update.newValue !== 'string') {
          throw new Error('newValue must be a string for EDIT_TAG_TEXT')
        }
        if (typeof update.target !== 'string') {
          throw new Error('target must be a string for EDIT_TAG_TEXT')
        }
        break

      case CurrentlyUpdateTypes.EDIT_TAG_DURATION:
        if (typeof update.newValue !== 'number') {
          throw new Error('newValue must be a number for EDIT_TAG_DURATION')
        }
        if (typeof update.target !== 'string') {
          throw new Error('target must be a string for EDIT_TAG_DURATION')
        }
        break

      case CurrentlyUpdateTypes.DELETE_TAG:
        if (typeof update.target !== 'string') {
          throw new Error('target must be a string for DELETE_TAG')
        }
        break

      case CurrentlyUpdateTypes.NEW_STATUS:
        if (!update.newValue || typeof update.newValue.text !== 'string' || typeof update.newValue.duration !== 'number') {
          throw new Error('newValue must contain text and duration for NEW_STATUS')
        }
        break

      case CurrentlyUpdateTypes.EDIT_STATUS_TEXT:
        if (typeof update.newValue !== 'string') {
          throw new Error('newValue must be a string for EDIT_STATUS_TEXT')
        }
        break

      case CurrentlyUpdateTypes.EDIT_STATUS_DURATION:
        if (typeof update.newValue !== 'number') {
          throw new Error('newValue must be a number for EDIT_STATUS_DURATION')
        }
        break

      case CurrentlyUpdateTypes.DELETE_STATUS:
        // No additional validation needed
        break

      case CurrentlyUpdateTypes.CLEAR_ALL:
        // No additional validation needed
        break

      default:
        throw new Error('invalid update type')
    }
  }
}

export const createCurrentlyValidation = [
  body('updates')
    .isArray()
    .withMessage('updates must be an array')
    .custom(updates => {
      validateUpdates(updates)
      return true
    }),
]

export const fetchCurrentlySingleValidation = [
  query('currentlyID')
    .notEmpty()
    .isString()
    .withMessage('currentlyID is not valid or null/empty'),
]

export const updateCurrentlyValidation = [
  // body('currentlyID')
  //   .notEmpty()
  //   .isString()
  //   .withMessage('currentlyID is required and must be a string'),
  body('updates')
    .isArray()
    .withMessage('updates must be an array')
    .custom(updates => {
      validateUpdates(updates)
      return true
    }),
]

export const deleteCurrentlyValidation = [
  body('currentlyID')
    .notEmpty()
    .isString()
    .withMessage('currentlyID is required and must be a string'),
]