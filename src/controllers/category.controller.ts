import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  addNewCategory,
  fetchAllCategories,
  fetchCategoryById,
  updateExistingCategory,
} from '../services/category.service'

export async function addCategory(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const createdCategory = await addNewCategory({
      name: reqBody.name,
      enabled: reqBody.enabled ? (reqBody.enabled as string) === 'true' : true,
      hidden: reqBody.hidden ? (reqBody.hidden as string) === 'true' : false,
      startDate: reqBody.startDate ? new Date(reqBody.startDate) : null,
      endDate: reqBody.endDate ? new Date(reqBody.endDate) : null,
    })

    return handleSuccess(res, { category: createdCategory })
  } catch (error) {
    console.error('Error occurred while adding the category', error)
    return handleError(res, error, 'Unable to add the category')
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const updatedCategory = await updateExistingCategory({
      categoryId: reqBody.categoryId,
      categoryReq: {
        name: reqBody.name,
        enabled: reqBody.enabled
          ? (reqBody.enabled as string) === 'true'
          : true,
        hidden: reqBody.hidden ? (reqBody.hidden as string) === 'true' : false,
        startDate: reqBody.startDate ? new Date(reqBody.startDate) : null,
        endDate: reqBody.endDate ? new Date(reqBody.endDate) : null,
      },
    })

    return handleSuccess(res, { category: updatedCategory })
  } catch (error) {
    console.error('Error occurred while updating the category', error)
    return handleError(res, error, 'Unable to update the category')
  }
}

export async function fetchCategories(req: Request, res: Response) {
  try {
    const enabled = req.query.enabled
      ? (req.query.enabled as string) === 'true'
      : null

    const categories = await fetchAllCategories(enabled)

    return handleSuccess(res, { categories })
  } catch (error) {
    console.error('Error occurred while fetching all the categories', error)
    return handleError(res, error, 'Unable to fetch all the categories')
  }
}

export async function fetchCategory(req: Request, res: Response) {
  try {
    const categoryId = req.params.id
    const category = await fetchCategoryById(categoryId)

    return handleSuccess(res, { category })
  } catch (error) {
    console.error('Error occurred while fetching the category', error)
    return handleError(res, error, 'Unable to fetch the category')
  }
}
