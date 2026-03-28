"use client"

import React from 'react'

type Props = {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, title = 'Потвърждение', description, confirmLabel = 'Да, изтрий', cancelLabel = 'Откажи', onConfirm, onCancel }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="mt-2 text-sm text-stone-600">{description}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded px-4 py-2 text-sm border">{cancelLabel}</button>
          <button onClick={onConfirm} className="rounded bg-red-600 px-4 py-2 text-sm text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
