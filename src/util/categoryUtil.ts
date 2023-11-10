import type { CategoryDocument } from '../models/category.model'
import type { CategoryResponse } from '../types/category.types'

export function mapCategory(
  categoryDoc: CategoryDocument | null
): CategoryResponse | null {
  if (!categoryDoc) {
    return null
  }

  return {
    id: categoryDoc._id,
    name: categoryDoc.name,
    enabled: categoryDoc.enabled,
    hidden: categoryDoc.hidden,
    startDate: categoryDoc.startDate,
    endDate: categoryDoc.endDate,
  }
}
