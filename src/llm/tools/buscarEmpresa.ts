import { ToolDefinition } from "../LlmClient";

export const buscarEmpresaTool: ToolDefinition = {
  name: "buscar_empresa",
  description: "Busca información pública de una empresa por su nombre o dominio",
  parameters: {
    type: "object",
    properties: {
      nombre: { type: "string", description: "Nombre o dominio de la empresa" },
    },
    required: ["nombre"],
  },
};

// Mock por ahora — acá después va la llamada real a una API de enriquecimiento.
export async function ejecutarBuscarEmpresa(args: { nombre: string }) {
  return {
    nombre: args.nombre,
    industria: "Tecnología",
    empleados: "50-200",
    descripcion: `${args.nombre} es una empresa de software (dato simulado, TODO conectar API real)`,
  };
}
