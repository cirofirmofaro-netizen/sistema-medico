export default function ConfirmDialog({ 
  open, 
  title, 
  description, 
  confirmLabel = "Confirmar", 
  tone = "neutral", 
  onCancel, 
  onConfirm 
}: {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  tone?: "neutral" | "danger"
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null

  const danger = tone === "danger"

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl border bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold">{title}</div>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-md border px-3 py-1.5" onClick={onCancel}>
            Cancelar
          </button>
          <button 
            className={`rounded-md px-3 py-1.5 text-white ${danger ? "bg-red-600" : "bg-gray-900"}`} 
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
