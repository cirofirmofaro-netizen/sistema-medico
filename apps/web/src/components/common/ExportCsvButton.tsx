import { Download } from 'lucide-react'

interface ExportCsvButtonProps {
  onExport: () => { headers: string[], rows: any[][], filename: string } | undefined
}

export function ExportCsvButton({ onExport }: ExportCsvButtonProps) {
  const handleExport = () => {
    const data = onExport()
    if (!data) return

    const { headers, rows, filename } = data
    
    // Criar conteúdo CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <button
      onClick={handleExport}
      className="btn btn-secondary flex items-center"
    >
      <Download className="h-4 w-4 mr-2" />
      Exportar CSV
    </button>
  )
}
