"use client"

import React, { useMemo, useState } from 'react'
import ConfirmModal from '@/components/confirm-modal'

type CommentItem = {
  id: string
  body: string
  createdAt: string
  author?: { name?: string | null; email?: string | null }
  recipe: { slug: string; title: string }
}

export default function CommentsListClient({ comments }: { comments: CommentItem[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  const allSelected = useMemo(() => comments.length > 0 && comments.every((c) => selected[c.id]), [comments, selected])

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  function toggleAll() {
    if (allSelected) {
      setSelected({})
      return
    }
    const map: Record<string, boolean> = {}
    comments.forEach((c) => (map[c.id] = true))
    setSelected(map)
  }

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDelete, setToDelete] = useState<string[]>([])

  function openConfirmForSelected() {
    const ids = Object.keys(selected).filter((k) => selected[k])
    if (ids.length === 0) return
    setToDelete(ids)
    setConfirmOpen(true)
  }

  async function deleteSelectedConfirmed() {
    if (toDelete.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: toDelete }),
      })

      if (res.ok) {
        location.reload()
      } else {
        const json = await res.json()
        alert(json?.error ?? 'Грешка при изтриване')
      }
    } catch (e) {
      console.error(e)
      alert('Грешка при изтриване')
    } finally {
      setLoading(false)
      setConfirmOpen(false)
      setToDelete([])
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={toggleAll} className="text-sm font-semibold text-stone-700 underline">
            {allSelected ? 'Отмени селекцията' : 'Избери всички'}
          </button>
          <button onClick={openConfirmForSelected} disabled={loading} className="ml-2 rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-60">
            {loading ? 'Изтриване...' : 'Изтрий маркираните'}
          </button>
        </div>
        <div className="text-sm text-stone-500">{comments.length} коментара</div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Потвърди изтриване"
        description={`Сигурни ли сте, че искате да изтриете ${toDelete.length} коментара?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={deleteSelectedConfirmed}
      />

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="p-4 border rounded-md flex justify-between gap-4">
            <div>
              <div className="text-sm text-stone-600">От: {c.author?.name ?? c.author?.email}</div>
              <div className="text-sm text-stone-500">Рецепта: <a href={`/recipes/${c.recipe.slug}`} className="underline">{c.recipe.title}</a></div>
              <div className="mt-2 text-stone-800">{c.body}</div>
              <div className="text-xs text-stone-400 mt-2">{new Date(c.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex flex-col items-end justify-start gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!selected[c.id]} onChange={() => toggle(c.id)} />
                <span className="text-sm text-stone-600">Маркирай</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
