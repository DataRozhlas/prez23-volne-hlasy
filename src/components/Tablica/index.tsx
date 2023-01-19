import DataTable from "react-data-table-component";

interface Row {
  NAZ_OBEC: string;
  OKRES: string;
  result: number;
  ZAPSANI_VOLICI: number;
  TYP_OBEC: string;
  "kand-4": string;
  "kand-7": string;
}

const columns = [
  {
    name: <p className="font-bold text-center">Obec</p>,
    selector: (row: Row) => row.NAZ_OBEC,
    grow: 2,
  },
  {
    name: <p className="font-bold text-center">Okres</p>,
    selector: (row: Row) => row.OKRES,
    grow: 2,
  },
  {
    name: <p className="font-bold text-center">Nevyužitých hlasů</p>,
    selector: (row: Row) => row.result,
    format: (row: Row) => row.result.toLocaleString("cs-CZ"),
    sortable: true,
    center: true,
    grow: 1,
  },
  {
    name: <p className="font-bold text-center">Z oprávněných voličů</p>,
    selector: (row: Row) => Math.round((row.result / row.ZAPSANI_VOLICI) * 100),
    format: (row: Row) =>
      `${Math.round((row.result / row.ZAPSANI_VOLICI) * 100)} %`,
    sortable: true,
    center: true,
    grow: 1,
    wrap: true,
  },
  {
    name: <p className="font-bold text-center">Vítěz 1. kola</p>,
    selector: (row: Row) => {
      const Pavel = Number(row["kand-4"]);
      const Babis = Number(row["kand-7"]);
      return Pavel > Babis ? "Pavel" : "Babis";
    },
    grow: 1,
    wrap: true,
    center: true,
  },
];

const paginationComponentOptions = {
  rowsPerPageText: "Obcí na stránku",
  rangeSeparatorText: "z",
  selectAllRowsItem: true,
  selectAllRowsItemText: "všechny",
};

const Tablica = (props: any) => {
  return (
    <DataTable
      columns={columns}
      data={props.data.filter((obec: Row) => obec.TYP_OBEC !== "MCMO")}
      dense
      pagination
      paginationComponentOptions={paginationComponentOptions}
    />
  );
};

export { Tablica };
