import { Empty, Heading } from "@/components/platform/ui";
export const metadata = { title: "Beneficios · RidePerks" };
export default function Page() {
  return (
    <div className="rp-stack">
      <Heading title="Beneficios para tu día">
        Encuentra tu próxima parada y revisa las condiciones antes de ir.
      </Heading>
      <Empty title="Próximamente: más beneficios">
        <p>
          Estamos cerrando los últimos detalles con nuestros comercios
          aliados. Muy pronto vas a encontrar aquí descuentos en
          mantenimiento, comida y combustible.
        </p>
      </Empty>
    </div>
  );
}
