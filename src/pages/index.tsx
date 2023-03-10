import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RangeSlider, Tablica, Mapa } from "../components";
import { tsvParse, dsvFormat } from "d3-dsv";
import { usePostMessageWithHeight } from "../hooks";
import elementResizeEvent from "element-resize-event";

interface Obec {
  NAZ_OBEC: string;
  OKRES: string;
  result: number;
  pct: number;
  ZAPSANI_VOLICI: number;
  TYP_OBEC: string;
  "kand-4": string;
  "kand-7": string;
}

const fetchData = async (context: { queryKey: any[] }) => {
  if (context.queryKey[0] === "kandidati") {
    const ssv = dsvFormat(";");
    const urlDetail = `${context.queryKey[1]}/perk.csv`;
    const data = await fetch(`https://data.irozhlas.cz/prez/${urlDetail}`)
      .then(res => res.text())
      .then(res => ssv.parse(res));
    return data;
  }
  if (context.queryKey[0] === "vysledky") {
    const urlDetail = `${context.queryKey[1]}/obce-${context.queryKey[2]}.tsv`;
    const data = await fetch(`https://data.irozhlas.cz/prez/${urlDetail}`)
      .then(res => res.text())
      .then(res => tsvParse(res));
    return data;
  }
};

const addOrRemove = (array: number[], value: number) => {
  const index = array.indexOf(value);
  const newArray = [...array];
  if (index === -1) {
    newArray.push(value);
  } else {
    newArray.splice(index, 1);
  }
  return newArray;
};

const VolneHlasy = () => {
  const [popLimit, setPopLimit] = useState(15000);
  const [finalResult, setFinalResult] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([6, 1, 9, 8]);
  const [tableHeight, setTableHeight] = useState(408);
  const [content, setContent] = useState(" ");

  const { containerRef, postHeightMessage } =
    usePostMessageWithHeight("cro-volne-hlasy");

  const table = useRef<HTMLElement | any>(null);

  const candidates = useQuery({
    queryKey: ["kandidati", 2023],
    queryFn: fetchData,
  });

  const results = useQuery({
    queryKey: ["vysledky", 2023, 1],
    queryFn: fetchData,
  });

  if (table.current) {
    elementResizeEvent(table.current, function () {
      setTableHeight(table.current?.clientHeight);
      console.log(table.current?.clientHeight);
    });
  }

  const options = [
    { id: 6, name: "Danu??e Nerudov??", description: "777 022 hlas??" },
    { id: 1, name: "Pavla Fischera", description: "376???705 hlas??" },
    { id: 2, name: "Jaroslava Ba??ty", description: "248???375 hlas??" },
    { id: 9, name: "Marka Hil??era", description: "142???908 hlas??" },
    { id: 8, name: "Karla Divi??e", description: "75???479 hlas??" },
    { id: 5, name: "Tom????e Zimy", description: "30???827 hlas??" },
    { id: 0, name: "Nevoli????", description: "2 667 377 hlas??" },
  ];

  useMemo(() => {
    if (results.data) {
      const volneHlasy: any = results.data
        .filter(obec => obec.TYP_OBEC !== "MCMO")
        .filter(obec => Number(obec.ZAPSANI_VOLICI) > popLimit)
        .map(obec => {
          return {
            ...obec,
            result: (function () {
              const candidatesVotes = selectedCandidates.reduce(
                (acc: number, curr: any) => {
                  return acc + Number(obec[`kand-${curr}`]);
                },
                0
              );
              return candidatesVotes;
            })(),
            pct: (function () {
              const candidatesVotes = selectedCandidates.reduce(
                (acc: number, curr: any) => {
                  return acc + Number(obec[`kand-${curr}`]);
                },
                0
              );
              const volici = Number(obec.ZAPSANI_VOLICI);
              return (candidatesVotes / volici) * 100;
            })(),
          };
        })
        .sort((a: any, b: any) => b.result - a.result);
      // console.log(volneHlasy);
      setFinalResult(volneHlasy);
    }
  }, [results.data, selectedCandidates, popLimit]);

  useEffect(() => {
    postHeightMessage();
  }, [finalResult, tableHeight, postHeightMessage]);

  if (results.isLoading || candidates.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">Stahuji data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white" ref={containerRef}>
      <h1 className="text-2xl font-bold leading-6 pb-2">
        Kde ???le???? na ulici??? nejv??c voln??ch hlas???
      </h1>
      <h2 className="leading-4 pb-0">
        Mapa ukazuje procenta, absolut?? po??ty hlas?? jsou dole v tabulce
      </h2>
      <Mapa
        setTooltipContent={setContent}
        selectedCandidates={selectedCandidates}
      ></Mapa>
      <div className="text-right pr-2 h-4 pb-6">{content}</div>
      <fieldset className="space-y-1">
        <legend className="font-medium text-gray-900">Zapo????tat hlasy</legend>
        {options.map(option => (
          <div key={option.id} className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id={`person-${option.id}`}
                name={`person-${option.id}`}
                value={option.id}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={selectedCandidates.includes(option.id)}
                onChange={e => {
                  const value = Number(e.target.value);
                  const newSelectedCandidates = addOrRemove(
                    selectedCandidates,
                    value
                  );
                  setSelectedCandidates(newSelectedCandidates);
                }}
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor={`person-${option.id}`}
                className="font-medium text-gray-700"
              >
                {option.name}
              </label>
              <span id="comments-description" className="text-gray-500">
                <span className="sr-only">{option.name}</span>
                {` ${option.description}`}
              </span>
            </div>
          </div>
        ))}
      </fieldset>
      <div className="py-6">
        <RangeSlider
          popLimit={popLimit}
          setPopLimit={setPopLimit}
        ></RangeSlider>
      </div>
      <div ref={table}>
        <Tablica data={finalResult}></Tablica>
      </div>
    </div>
  );
};

export default VolneHlasy;
