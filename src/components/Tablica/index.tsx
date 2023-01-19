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
    name: <div className="coltit">Obec</div>,
    selector: (row: Row) => row.NAZ_OBEC,
    grow: 2,
  },
  {
    name: <p className="coltit">Okres</p>,
    selector: (row: Row) => row.OKRES,
    grow: 2,
  },
  {
    name: <p className="coltit">Nevyužitých hlasů</p>,
    selector: (row: Row) => row.result,
    format: (row: Row) => row.result.toLocaleString("cs-CZ"),
    style: { whiteSpace: "unset" },
    sortable: true,
    center: true,
    grow: 1,
  },
  {
    name: <p className="coltit">Z oprávněných voličů</p>,
    selector: (row: Row) => Math.round((row.result / row.ZAPSANI_VOLICI) * 100),
    format: (row: Row) =>
      `${Math.round((row.result / row.ZAPSANI_VOLICI) * 100)} %`,
    sortable: true,
    center: true,
    grow: 1,
    id: "procenta",
  },
  {
    name: <p className="coltit">Víc hlasů v 1. kole</p>,
    selector: (row: Row) => {
      const Pavel = Number(row["kand-4"]);
      const Babis = Number(row["kand-7"]);
      return Pavel > Babis ? "Pavel" : "Babiš";
    },
    grow: 1,
    center: true,
  },
];

const paginationComponentOptions = {
  rowsPerPageText: "Obcí na stránku",
  rangeSeparatorText: "z",
  selectAllRowsItem: false,
  selectAllRowsItemText: "všechny",
  noRowsPerPage: false,
};

const customStyles = {
  headCells: {
    style: {
      paddingLeft: "4px",
      paddingRight: "4px",
      fontWeight: "800",
    },
    draggingStyle: {
      cursor: "move",
    },
  },
};

const Tablica = (props: any) => {
  return (
    <DataTable
      columns={columns}
      data={props.data.filter((obec: Row) => obec.TYP_OBEC !== "MCMO")}
      dense
      pagination
      paginationComponentOptions={paginationComponentOptions}
      customStyles={customStyles}
    />
  );
};

export { Tablica };
