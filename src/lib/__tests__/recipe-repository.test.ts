import { beforeEach, describe, expect, it } from 'vitest'
import * as repo from '../recipe-repository'

describe('recipe repository (sample data)', () => {
  beforeEach(() => {
    delete process.env.DATABASE_URL
  })

  it('getRecipes returns array and contains a known slug', async () => {
    const recipes = await repo.getRecipes()
    expect(Array.isArray(recipes)).toBe(true)
    const slugs = recipes.map((r) => r.slug)
    expect(slugs).toContain('banitsa-sas-sirene')
  })

  it('getFeaturedRecipes returns up to 3 items', async () => {
    const featured = await repo.getFeaturedRecipes()
    expect(featured.length).toBeLessThanOrEqual(3)
  })

  it('getRecipeBySlug finds a recipe by slug', async () => {
    const r = await repo.getRecipeBySlug('banitsa-sas-sirene')
    expect(r).toBeDefined()
    expect(r?.slug).toBe('banitsa-sas-sirene')
  })

  it('getRelatedRecipes returns same-category recipes', async () => {
    const related = await repo.getRelatedRecipes('banitsa-sas-sirene', 'zakuski')
    expect(Array.isArray(related)).toBe(true)
    expect(related.every((x) => x.categorySlug === 'zakuski')).toBe(true)
  })
})
