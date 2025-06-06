import { FEATURES } from "../constants/features";
import { Table } from "@radix-ui/themes";

const comparativa = [
	{
		funcionalidad: "Límite de series en catálogo",
		free: "10",
		pro: "Ilimitado",
	},
	{
		funcionalidad: "Límite de películas en catálogo",
		free: "20",
		pro: "Ilimitado",
	},
	{
		funcionalidad: "Sin anuncios",
		free: "❌",
		pro: "✅",
	},
	{
		funcionalidad: "Soporte prioritario",
		free: "❌",
		pro: "✅",
	},
	{
		funcionalidad: "Acceso anticipado a novedades",
		free: "❌",
		pro: "✅",
	},
	// Puedes añadir más filas según tus FEATURES
];

export default function Pro() {
	return (
		<div className="max-w-2xl mx-auto p-8">
			<h1 className="text-3xl font-bold mb-6">Ventajas PRO</h1>
			<Table.Root
				variant="surface"
				className="mb-8 rounded-lg overflow-hidden"
			>
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeaderCell>Funcionalidad</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell align="center">Free</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell align="center">PRO</Table.ColumnHeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{comparativa.map((row) => (
						<Table.Row key={row.funcionalidad}>
							<Table.RowHeaderCell>
								{row.funcionalidad}
							</Table.RowHeaderCell>
							<Table.Cell align="center">{row.free}</Table.Cell>
							<Table.Cell
								align="center"
								className="font-bold text-blue-700"
							>
								{row.pro}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
			<button className="bg-blue-600 text-white px-6 py-3 rounded font-semibold text-lg shadow hover:bg-blue-700 transition">
				Hazte PRO
			</button>
		</div>
	);
}