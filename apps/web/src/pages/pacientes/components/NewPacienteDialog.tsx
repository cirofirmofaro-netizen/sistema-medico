import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { createPaciente } from "../../../pacientes/api"
import { toast } from "sonner"
import MaskedInput from "../../../components/ui/MaskedInput"
import DatePicker from "../../../components/ui/DatePicker"
import Select from "../../../components/ui/Select"

const schema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  dtNasc: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cpf: z.string().optional(),
  endereco: z.string().optional(),
  sexo: z.string().optional(),
})

export default function NewPacienteDialog({ 
  open, 
  onOpenChange, 
  onCreated 
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue, watch } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  const mut = useMutation({
    mutationFn: (v: z.infer<typeof schema>) => createPaciente({
      nome: v.nome,
      dtNasc: v.dtNasc ? new Date(v.dtNasc).toISOString() : undefined,
      telefone: v.telefone,
      email: v.email || undefined,
      cpf: v.cpf,
      endereco: v.endereco,
      sexo: v.sexo,
    }),
    onSuccess: () => {
      toast.success("Paciente criado")
      onCreated()
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Falha ao criar paciente"),
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-lg rounded-xl border bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 text-lg font-semibold">Novo paciente</div>
        <form onSubmit={handleSubmit((v) => mut.mutate(v))} className="grid gap-3">
          <input 
            className="rounded-md border p-2" 
            placeholder="Nome *" 
            {...register("nome")} 
          />
          {errors.nome && <span className="text-sm text-red-600">{errors.nome.message}</span>}
          
          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              value={watch("dtNasc") || ""}
              onChange={(value) => setValue("dtNasc", value)}
              placeholder="Data de Nascimento"
            />
            <Select
              value={watch("sexo") || ""}
              onChange={(value) => setValue("sexo", value)}
              options={[
                { value: "M", label: "Masculino" },
                { value: "F", label: "Feminino" },
                { value: "O", label: "Outros" },
              ]}
              placeholder="Sexo"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <MaskedInput
              mask="phone"
              value={watch("telefone") || ""}
              onChange={(value) => setValue("telefone", value)}
              placeholder="Telefone"
            />
            <input 
              className="rounded-md border p-2" 
              placeholder="E-mail" 
              {...register("email")} 
            />
          </div>
          
          <MaskedInput
            mask="cpf"
            value={watch("cpf") || ""}
            onChange={(value) => setValue("cpf", value)}
            placeholder="CPF"
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
