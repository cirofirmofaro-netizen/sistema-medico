import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { updatePaciente } from "../../../pacientes/api"
import { toast } from "sonner"
import type { Paciente } from "../../../types"

const schema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  dtNasc: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cpf: z.string().optional(),
  endereco: z.string().optional(),
  sexo: z.string().optional(),
})

export default function EditPacienteDialog({ 
  paciente, 
  onOpenChange, 
  onSaved 
}: {
  paciente: Paciente | null
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if (!paciente) return
    setValue("nome", paciente.nome)
    setValue("dtNasc", paciente.dtNasc ? new Date(paciente.dtNasc).toISOString().slice(0, 10) : "")
    setValue("telefone", paciente.telefone ?? "")
    setValue("email", paciente.email ?? "")
    setValue("cpf", paciente.cpf ?? "")
    setValue("endereco", paciente.endereco ?? "")
    setValue("sexo", paciente.sexo ?? "")
  }, [paciente, setValue])

  const mut = useMutation({
    mutationFn: (v: z.infer<typeof schema>) => {
      if (!paciente) throw new Error("Sem paciente")
      return updatePaciente({
        id: paciente.id,
        nome: v.nome,
        dtNasc: v.dtNasc ? new Date(v.dtNasc).toISOString() : undefined,
        telefone: v.telefone,
        email: v.email || undefined,
        cpf: v.cpf,
        endereco: v.endereco,
        sexo: v.sexo,
      })
    },
    onSuccess: () => {
      toast.success("Paciente atualizado")
      onSaved()
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Falha ao atualizar"),
  })

  if (!paciente) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-lg rounded-xl border bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 text-lg font-semibold">Editar paciente</div>
        <form onSubmit={handleSubmit((v) => mut.mutate(v))} className="grid gap-3">
          <input 
            className="rounded-md border p-2" 
            placeholder="Nome *" 
            {...register("nome")} 
          />
          {errors.nome && <span className="text-sm text-red-600">{errors.nome.message}</span>}
          
          <div className="grid grid-cols-2 gap-3">
            <input 
              className="rounded-md border p-2" 
              type="date" 
              placeholder="Nascimento" 
              {...register("dtNasc")} 
            />
            <select className="rounded-md border p-2" {...register("sexo")}>
              <option value="">Sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <input 
              className="rounded-md border p-2" 
              placeholder="Telefone" 
              {...register("telefone")} 
            />
            <input 
              className="rounded-md border p-2" 
              placeholder="E-mail" 
              {...register("email")} 
            />
          </div>
          
          <input 
            className="rounded-md border p-2" 
            placeholder="CPF" 
            {...register("cpf")} 
          />
          <input 
            className="rounded-md border p-2" 
            placeholder="Endereço" 
            {...register("endereco")} 
          />
          
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              className="rounded-md border px-3 py-1.5" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="rounded-md border px-3 py-1.5 bg-gray-900 text-white" 
              disabled={isSubmitting}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
